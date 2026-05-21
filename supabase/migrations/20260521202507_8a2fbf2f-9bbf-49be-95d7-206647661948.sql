-- 1) New profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS business_interests jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ecosystem_member boolean NOT NULL DEFAULT false;

-- 2) Share-state enum
DO $$ BEGIN
  CREATE TYPE public.share_state AS ENUM ('private','shared_with_setter','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.toolbox_projects
  ADD COLUMN IF NOT EXISTS share_state public.share_state NOT NULL DEFAULT 'private';

UPDATE public.toolbox_projects
   SET share_state = 'published'
 WHERE show_in_vitrine = true AND share_state = 'private';

-- 3) RLS: admins can view projects that were shared with Setter (in addition to existing policies)
DROP POLICY IF EXISTS "Admins view shared studies" ON public.toolbox_projects;
CREATE POLICY "Admins view shared studies" ON public.toolbox_projects
  FOR SELECT
  USING (
    share_state IN ('shared_with_setter','published')
    AND (public.has_role(auth.uid(),'admin'::app_role) OR public.has_role(auth.uid(),'super_admin'::app_role))
  );

-- 4) Trigger: notify when project shared_with_setter
CREATE OR REPLACE FUNCTION public.notify_shared_with_setter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  author_name text;
BEGIN
  IF NEW.share_state = 'shared_with_setter'
     AND (OLD.share_state IS DISTINCT FROM 'shared_with_setter') THEN
    SELECT name INTO author_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
    INSERT INTO public.admin_notifications (type, title, message, link, entity_id)
    VALUES (
      'shared_with_setter',
      'Novo estudo compartilhado',
      COALESCE(author_name,'Usuário') || ' compartilhou "' || NEW.name || '" com a Setter',
      '/admin/shared-studies',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_shared_with_setter ON public.toolbox_projects;
CREATE TRIGGER trg_notify_shared_with_setter
AFTER INSERT OR UPDATE OF share_state ON public.toolbox_projects
FOR EACH ROW EXECUTE FUNCTION public.notify_shared_with_setter();