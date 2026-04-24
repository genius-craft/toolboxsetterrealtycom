// Extrai texto de um PDF anexado pelo usuário no chat da TOOL.
// - Aceita multipart/form-data com campo "file"
// - Limita 10 MB
// - Retorna { filename, pageCount, text } com texto truncado em 25k chars

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 25_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Envie como multipart/form-data com campo 'file'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Arquivo não encontrado no campo 'file'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (file.size === 0) {
      return new Response(
        JSON.stringify({ error: "Arquivo vazio." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: `Arquivo muito grande. Máximo ${MAX_SIZE / 1024 / 1024} MB.` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lowerName = (file.name || "").toLowerCase();
    if (!lowerName.endsWith(".pdf")) {
      return new Response(
        JSON.stringify({ error: "Apenas arquivos PDF são aceitos." }),
        { status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const buffer = await file.arrayBuffer();

    let pageCount = 0;
    let extractedText = "";
    try {
      const { extractText, getDocumentProxy } = await import("https://esm.sh/unpdf@0.12.1");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      pageCount = pdf.numPages || 0;
      const result = await extractText(pdf, { mergePages: true });
      extractedText = Array.isArray(result.text)
        ? result.text.join("\n\n")
        : (result.text as string) || "";
    } catch (e) {
      console.error("Falha extração PDF:", e);
      return new Response(
        JSON.stringify({ error: "Não consegui ler este PDF. Pode estar protegido ou corrompido." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleaned = extractedText.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    if (cleaned.length < 30) {
      return new Response(
        JSON.stringify({
          error: "Não encontrei texto neste PDF. Pode ser uma imagem escaneada (ainda não temos OCR).",
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const truncated = cleaned.length > MAX_TEXT_CHARS;
    const finalText = truncated ? cleaned.slice(0, MAX_TEXT_CHARS) : cleaned;

    return new Response(
      JSON.stringify({
        filename: file.name,
        pageCount,
        text: finalText,
        truncated,
        originalLength: cleaned.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("tool-extract-pdf erro:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
