
-- Drop existing user-scoped policies on toolbox_projects that don't check approval
DROP POLICY IF EXISTS "Users can view own projects" ON public.toolbox_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.toolbox_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.toolbox_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.toolbox_projects;

-- Recreate with approval check
CREATE POLICY "Users can view own projects"
  ON public.toolbox_projects FOR SELECT
  TO public
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND approved = true)
  );

CREATE POLICY "Users can insert own projects"
  ON public.toolbox_projects FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND approved = true)
  );

CREATE POLICY "Users can update own projects"
  ON public.toolbox_projects FOR UPDATE
  TO public
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND approved = true)
  );

CREATE POLICY "Users can delete own projects"
  ON public.toolbox_projects FOR DELETE
  TO public
  USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND approved = true)
  );
