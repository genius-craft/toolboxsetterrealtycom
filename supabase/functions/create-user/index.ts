import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10 // Max users per hour per super_admin
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

// Validation constants
const ALLOWED_CATEGORIES = ['corretor', 'investidor', 'proprietario', 'rede_varejo']

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

// Validation functions
function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email é obrigatório' }
  }
  if (email.length > 255) {
    return { valid: false, error: 'Email deve ter no máximo 255 caracteres' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' }
  }
  return { valid: true }
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Senha é obrigatória' }
  }
  if (password.length < 6) {
    return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' }
  }
  if (password.length > 72) {
    return { valid: false, error: 'Senha deve ter no máximo 72 caracteres' }
  }
  return { valid: true }
}

function validateName(name: string | null | undefined): { valid: boolean; error?: string; sanitized: string | null } {
  if (!name) return { valid: true, sanitized: null }
  if (typeof name !== 'string') {
    return { valid: false, error: 'Nome inválido', sanitized: null }
  }
  const trimmed = name.trim()
  if (trimmed.length > 100) {
    return { valid: false, error: 'Nome deve ter no máximo 100 caracteres', sanitized: null }
  }
  // Allow letters, numbers, spaces, hyphens, apostrophes (unicode support)
  const nameRegex = /^[\p{L}\p{N}\s'-]*$/u
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Nome contém caracteres inválidos', sanitized: null }
  }
  return { valid: true, sanitized: trimmed || null }
}

function validatePhone(phone: string | null | undefined): { valid: boolean; error?: string; sanitized: string | null } {
  if (!phone) return { valid: true, sanitized: null }
  if (typeof phone !== 'string') {
    return { valid: false, error: 'Telefone inválido', sanitized: null }
  }
  // Remove spaces for validation
  const sanitized = phone.replace(/\s/g, '')
  if (sanitized.length > 20) {
    return { valid: false, error: 'Telefone deve ter no máximo 20 caracteres', sanitized: null }
  }
  // Allow digits, parentheses, plus, hyphen
  const phoneRegex = /^[\d()+-]*$/
  if (!phoneRegex.test(sanitized)) {
    return { valid: false, error: 'Telefone deve conter apenas números e símbolos válidos', sanitized: null }
  }
  return { valid: true, sanitized: sanitized || null }
}

function validateCategory(category: string | null | undefined): { valid: boolean; error?: string; sanitized: string | null } {
  if (!category) return { valid: true, sanitized: null }
  if (typeof category !== 'string') {
    return { valid: false, error: 'Categoria inválida', sanitized: null }
  }
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return { valid: false, error: 'Categoria inválida', sanitized: null }
  }
  return { valid: true, sanitized: category }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the caller is a super_admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify JWT and get claims
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.error('Claims error:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const callerId = claimsData.claims.sub as string

    // Check if caller is super_admin using admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'super_admin')
      .maybeSingle()

    if (roleError || !roleData) {
      console.error('Role check error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Acesso negado: permissão de super admin necessária' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check rate limit
    if (!checkRateLimit(callerId)) {
      console.warn(`Rate limit exceeded for user ${callerId}`)
      return new Response(
        JSON.stringify({ error: 'Limite de criação de usuários atingido. Tente novamente mais tarde.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { email, password, name, phone, category } = await req.json()

    // Validate all inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return new Response(
        JSON.stringify({ error: emailValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ error: passwordValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return new Response(
        JSON.stringify({ error: nameValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.valid) {
      return new Response(
        JSON.stringify({ error: phoneValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const categoryValidation = validateCategory(category)
    if (!categoryValidation.valid) {
      return new Response(
        JSON.stringify({ error: categoryValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user using admin client
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) {
      console.error('Create user error:', userError)
      // Return user-friendly error message
      const userMessage = userError.message.includes('already registered')
        ? 'Este email já está cadastrado'
        : 'Não foi possível criar o usuário'
      return new Response(
        JSON.stringify({ error: userMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created:', userData.user.id)

    // Create profile with approved status using validated data
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userData.user.id,
        name: nameValidation.sanitized,
        phone: phoneValidation.sanitized,
        category: categoryValidation.sanitized,
        approved: true,
        approved_at: new Date().toISOString(),
        approved_by: callerId,
      })

    if (profileError) {
      console.error('Create profile error:', profileError)
      // If profile creation fails, we should delete the created user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar perfil do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Profile created for user:', userData.user.id)

    return new Response(
      JSON.stringify({ success: true, user: { id: userData.user.id, email: userData.user.email } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
