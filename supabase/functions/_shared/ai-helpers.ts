// Helpers compartilhados pelas edge functions de IA do Setter Toolbox.
// Importado por tool-autofill, tool-analyze, tool-vitrine-copy,
// tool-pdf-summary e tool-compare.
//
// Padrão usado:
// 1. validateAuthAndApproved: valida JWT + checa profiles.approved
// 2. checkAndIncrementRateLimit: bucket horário em tool_chat_usage
// 3. callLovableAI: chama o gateway com tool-calling opcional

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export interface AuthContext {
  userId: string;
  isAdmin: boolean;
  admin: SupabaseClient;
}

/** Valida o Authorization header e checa profiles.approved. */
export async function validateAuthAndApproved(req: Request): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: Response }
> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, response: jsonResponse({ error: "Não autorizado." }, 401) };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const admin = createClient(supabaseUrl, serviceKey);
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return {
      ok: false,
      response: jsonResponse({ error: "Sessão inválida. Faça login novamente." }, 401),
    };
  }
  const userId = claimsData.claims.sub as string;

  const { data: profileRow } = await admin
    .from("profiles")
    .select("approved")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profileRow?.approved) {
    return {
      ok: false,
      response: jsonResponse({ error: "Sua conta ainda não foi aprovada para usar a IA." }, 403),
    };
  }

  const { data: roleRows } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const isAdmin = (roleRows ?? []).some(
    (r: { role: string }) => r.role === "admin" || r.role === "super_admin",
  );

  return { ok: true, ctx: { userId, isAdmin, admin } };
}

/** Checa e incrementa rate-limit horário compartilhado (tabela tool_chat_usage). */
export async function checkAndIncrementRateLimit(
  ctx: AuthContext,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  let userLimit = ctx.isAdmin ? 120 : 30;

  // Lê limites configuráveis (mesmo bucket do chat)
  try {
    const { data: cfgRows } = await ctx.admin
      .from("tool_config")
      .select("key,value")
      .in("key", ["chat_rate_limit_user", "chat_rate_limit_admin"]);
    for (const row of cfgRows ?? []) {
      if (row.key === "chat_rate_limit_user" && typeof row.value === "number" && !ctx.isAdmin) {
        userLimit = row.value;
      } else if (row.key === "chat_rate_limit_admin" && typeof row.value === "number" && ctx.isAdmin) {
        userLimit = row.value;
      }
    }
  } catch {
    // ignora — usa defaults
  }

  const now = new Date();
  const windowStart = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    0, 0, 0,
  ).toISOString();

  const { data: usageRow } = await ctx.admin
    .from("tool_chat_usage")
    .select("request_count")
    .eq("user_id", ctx.userId)
    .eq("window_start", windowStart)
    .maybeSingle();

  const currentCount = usageRow?.request_count ?? 0;
  if (currentCount >= userLimit) {
    return {
      ok: false,
      response: jsonResponse(
        { error: `Você atingiu o limite de ${userLimit} requisições de IA por hora. Tente novamente em alguns minutos.` },
        429,
      ),
    };
  }

  if (usageRow) {
    await ctx.admin
      .from("tool_chat_usage")
      .update({ request_count: currentCount + 1, updated_at: new Date().toISOString() })
      .eq("user_id", ctx.userId)
      .eq("window_start", windowStart);
  } else {
    await ctx.admin
      .from("tool_chat_usage")
      .insert({ user_id: ctx.userId, window_start: windowStart, request_count: 1 });
  }

  return { ok: true };
}

export interface AIToolDef {
  name: string;
  description: string;
  // JSON Schema for the tool's `parameters`
  parameters: Record<string, unknown>;
}

export interface CallAIOptions {
  systemPrompt: string;
  userPrompt: string;
  /** Se fornecido, força a IA a chamar essa tool e retorna os args parseados. */
  tool?: AIToolDef;
  /** Modelo override. Default: google/gemini-3-flash-preview */
  model?: string;
  /** Max chars de payload (system+user). Default 50k. */
  maxChars?: number;
}

export interface CallAIResult {
  /** Texto livre quando não há tool. */
  text?: string;
  /** Argumentos da tool quando `tool` foi passado. */
  toolArgs?: Record<string, unknown>;
}

/** Chama o Lovable AI Gateway. Trata 429/402 com mensagens amigáveis. */
export async function callLovableAI(opts: CallAIOptions): Promise<
  { ok: true; data: CallAIResult } | { ok: false; response: Response }
> {
  const { systemPrompt, userPrompt, tool, model = "google/gemini-3-flash-preview" } = opts;
  const maxChars = opts.maxChars ?? 50_000;

  const totalChars = systemPrompt.length + userPrompt.length;
  if (totalChars > maxChars) {
    return {
      ok: false,
      response: jsonResponse(
        { error: `Payload muito grande (${totalChars} caracteres). Limite: ${maxChars}.` },
        413,
      ),
    };
  }

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    console.error("LOVABLE_API_KEY ausente");
    return { ok: false, response: jsonResponse({ error: "Configuração de IA ausente." }, 500) };
  }

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  if (tool) {
    body.tools = [
      {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      },
    ];
    body.tool_choice = { type: "function", function: { name: tool.name } };
  }

  let resp: Response;
  try {
    resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("Falha ao chamar Lovable AI:", e);
    return { ok: false, response: jsonResponse({ error: "Falha de rede ao contatar a IA." }, 503) };
  }

  if (!resp.ok) {
    if (resp.status === 429) {
      return {
        ok: false,
        response: jsonResponse(
          { error: "Limite de uso da IA atingido. Tente em alguns minutos." },
          429,
        ),
      };
    }
    if (resp.status === 402) {
      return {
        ok: false,
        response: jsonResponse(
          { error: "Créditos da plataforma esgotados. Avise o administrador." },
          402,
        ),
      };
    }
    const txt = await resp.text().catch(() => "");
    console.error("Lovable AI erro:", resp.status, txt);
    return { ok: false, response: jsonResponse({ error: "Erro no provedor de IA." }, 502) };
  }

  const json = await resp.json().catch(() => null) as
    | { choices?: { message?: { content?: string; tool_calls?: { function?: { arguments?: string } }[] } }[] }
    | null;

  if (!json?.choices?.[0]?.message) {
    console.error("Resposta IA sem choices:", json);
    return { ok: false, response: jsonResponse({ error: "Resposta da IA inválida." }, 502) };
  }

  const message = json.choices[0].message;

  if (tool) {
    const argsStr = message.tool_calls?.[0]?.function?.arguments;
    if (!argsStr) {
      console.error("IA não chamou a tool:", message);
      return {
        ok: false,
        response: jsonResponse({ error: "IA não retornou dados estruturados." }, 502),
      };
    }
    try {
      const parsed = JSON.parse(argsStr);
      return { ok: true, data: { toolArgs: parsed } };
    } catch (e) {
      console.error("Falha ao parsear args da tool:", argsStr, e);
      return {
        ok: false,
        response: jsonResponse({ error: "Resposta estruturada da IA inválida." }, 502),
      };
    }
  }

  return { ok: true, data: { text: message.content ?? "" } };
}
