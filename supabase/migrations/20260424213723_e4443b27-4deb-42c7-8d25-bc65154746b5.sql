-- Tabela de documentos enviados pelo admin
CREATE TABLE public.tool_knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  original_filename text NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  chunk_count integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tool documents"
ON public.tool_knowledge_documents
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER tool_knowledge_documents_updated_at
BEFORE UPDATE ON public.tool_knowledge_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de chunks (pedaços buscáveis)
CREATE TABLE public.tool_knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.tool_knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', content)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tool_knowledge_chunks_tsv_idx
  ON public.tool_knowledge_chunks USING GIN (content_tsv);

CREATE INDEX tool_knowledge_chunks_doc_idx
  ON public.tool_knowledge_chunks (document_id);

ALTER TABLE public.tool_knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tool chunks"
ON public.tool_knowledge_chunks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Bucket de Storage privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-knowledge', 'tool-knowledge', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins read tool-knowledge files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tool-knowledge'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "Admins upload tool-knowledge files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tool-knowledge'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "Admins update tool-knowledge files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tool-knowledge'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "Admins delete tool-knowledge files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tool-knowledge'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);