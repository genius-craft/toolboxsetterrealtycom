// Sanitize error messages to avoid exposing internal details to users

const GENERIC_ERROR = 'Ocorreu um erro. Tente novamente.';

// Auth-related error messages that are safe to show to users
const AUTH_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Confirme seu email antes de entrar.',
  'User already registered': 'Este email já está cadastrado.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Unable to validate email address: invalid format': 'Formato de email inválido.',
  'Signup requires a valid password': 'Senha inválida.',
  'User not found': 'Usuário não encontrado.',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  'For security purposes, you can only request this after': 'Aguarde antes de tentar novamente.',
};

// Check if error message is an auth-related error (safe to show)
function isAuthError(message: string): boolean {
  return Object.keys(AUTH_ERROR_MAP).some(key => message.includes(key));
}

// Get user-friendly message for auth errors
function getAuthErrorMessage(message: string): string {
  for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
    if (message.includes(key)) {
      return value;
    }
  }
  return message;
}

/**
 * Sanitize an error message for display to users.
 * Auth errors are mapped to user-friendly messages.
 * Database/system errors return a generic message.
 */
export function sanitizeErrorMessage(error: unknown, fallback?: string): string {
  if (!error) return fallback || GENERIC_ERROR;

  const message = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : GENERIC_ERROR;

  // Check if it's a safe auth error
  if (isAuthError(message)) {
    return getAuthErrorMessage(message);
  }

  // Check for custom error messages (from our own validation)
  if (message.startsWith('Sua conta') || // Custom approval message
      message.includes('obrigatóri') ||  // Required field messages
      message.includes('inválid') ||     // Invalid field messages
      message.includes('deve ter') ||    // Validation messages
      message.includes('caracteres')     // Length validation
  ) {
    return message;
  }

  // For database/system errors, return generic message
  return fallback || GENERIC_ERROR;
}

/**
 * Sanitize error for edge function responses.
 * Logs the original error and returns a safe message.
 */
export function sanitizeEdgeFunctionError(error: unknown, context: string): string {
  // Log the real error for debugging (visible in Supabase logs)
  console.error(`[${context}]`, error);
  
  // Return generic message
  return 'Erro interno do servidor. Tente novamente.';
}
