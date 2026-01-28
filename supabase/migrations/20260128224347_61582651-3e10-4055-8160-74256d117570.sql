-- Adicionar coluna de aprovação
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;

-- Adicionar coluna de data de aprovação
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Adicionar coluna de quem aprovou
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Criar política para admins poderem ver todos os profiles (para a página de admin)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Criar política para admins poderem atualizar o status de aprovação
CREATE POLICY "Admins can update approval status" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Permitir que qualquer usuário autenticado insira seu próprio profile (necessário para cadastro)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);