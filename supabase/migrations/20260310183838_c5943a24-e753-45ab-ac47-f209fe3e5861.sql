
-- Fix Security Definer View warnings by setting SECURITY INVOKER
ALTER VIEW public.properties_public SET (security_invoker = on);
ALTER VIEW public.properties_authenticated SET (security_invoker = on);
