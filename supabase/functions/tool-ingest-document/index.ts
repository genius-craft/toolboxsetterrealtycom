// Ingestão de documentos para a base de conhecimento da TOOL
// - baixa o arquivo do bucket tool-knowledge
// - extrai texto (txt/md direto, pdf via pdfjs, docx via mammoth)
// - quebra em chunks
// - insere em tool_knowledge_chunks

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  documentId: z.string().uuid(),
});

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

function chunkText(text: string): string[] {
  // Normaliza
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length <= CHUNK_SIZE) return [clean];

  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + CHUNK_SIZE, clean.length);
    // Tenta quebrar em fim de parágrafo / frase
    if (end < clean.length) {
      const slice = clean.slice(i, end);
      const lastPara = slice.lastIndexOf("\n\n");
      const lastSent = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("? "), slice.lastIndexOf("! "));
      if (lastPara > CHUNK_SIZE * 0.5) end = i + lastPara + 2;
      else if (lastSent > CHUNK_SIZE * 0.5) end = i + lastSent + 2;
    }
    chunks.push(clean.slice(i, end).trim());
    if (end >= clean.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 20);
}

async function extractText(buffer: ArrayBuffer, fileType: string): Promise<string> {
  const t = fileType.toLowerCase();

  if (t === "txt" || t === "md") {
    return new TextDecoder("utf-8").decode(buffer);
  }

  if (t === "docx") {
    // mammoth via esm.sh
    const mammoth = await import("https://esm.sh/mammoth@1.8.0?bundle");
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || "";
  }

  if (t === "pdf") {
    // unpdf é puro JS (fork do pdfjs sem dependências nativas) — funciona em Deno/Edge
    const { extractText: unpdfExtract, getDocumentProxy } = await import("https://esm.sh/unpdf@0.12.1");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await unpdfExtract(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n\n") : (text as string);
  }

  throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "documentId inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { documentId } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Busca metadados do doc
    const { data: doc, error: docErr } = await admin
      .from("tool_knowledge_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return new Response(
        JSON.stringify({ error: "Documento não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Baixa do storage
    const { data: file, error: fileErr } = await admin.storage
      .from("tool-knowledge")
      .download(doc.storage_path);

    if (fileErr || !file) {
      console.error("Erro download:", fileErr);
      return new Response(
        JSON.stringify({ error: "Falha ao baixar arquivo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const buffer = await file.arrayBuffer();
    const text = await extractText(buffer, doc.file_type);

    if (!text || text.trim().length < 20) {
      await admin.from("tool_knowledge_documents")
        .update({ chunk_count: 0 })
        .eq("id", documentId);
      return new Response(
        JSON.stringify({ error: "Não foi possível extrair texto do documento." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const chunks = chunkText(text);

    // Limpa chunks antigos (caso seja reprocessamento)
    await admin.from("tool_knowledge_chunks").delete().eq("document_id", documentId);

    // Insere em batch
    const rows = chunks.map((content, idx) => ({
      document_id: documentId,
      chunk_index: idx,
      content,
    }));

    // Insert em lotes de 50 para evitar payload gigante
    for (let i = 0; i < rows.length; i += 50) {
      const slice = rows.slice(i, i + 50);
      const { error: insErr } = await admin.from("tool_knowledge_chunks").insert(slice);
      if (insErr) {
        console.error("Erro insert chunks:", insErr);
        return new Response(
          JSON.stringify({ error: "Falha ao salvar chunks" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    await admin.from("tool_knowledge_documents")
      .update({ chunk_count: chunks.length })
      .eq("id", documentId);

    return new Response(
      JSON.stringify({ success: true, chunkCount: chunks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("tool-ingest-document erro:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
