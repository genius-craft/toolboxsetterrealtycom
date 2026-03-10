
-- ============================================
-- ENUM
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'super_admin', 'hunter');

-- ============================================
-- FUNCTION: update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- TABLE: user_roles (created first for has_role dependency)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTION: has_role (SECURITY DEFINER)
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- TABLE: profiles
-- ============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  category TEXT,
  avatar_url TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TABLE: toolbox_projects
-- ============================================
CREATE TABLE public.toolbox_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_type TEXT NOT NULL,
  name TEXT NOT NULL,
  inputs JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  show_in_vitrine BOOLEAN NOT NULL DEFAULT false,
  vitrine_title TEXT,
  vitrine_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.toolbox_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.toolbox_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.toolbox_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.toolbox_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.toolbox_projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view vitrine projects"
  ON public.toolbox_projects FOR SELECT
  USING (show_in_vitrine = true);

CREATE POLICY "Admins can view all projects"
  ON public.toolbox_projects FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update all projects"
  ON public.toolbox_projects FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_toolbox_projects_updated_at
  BEFORE UPDATE ON public.toolbox_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TABLE: properties
-- ============================================
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  property_type TEXT,
  status TEXT DEFAULT 'available',
  price NUMERIC,
  area_total NUMERIC,
  area_built NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spots INTEGER,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  latitude NUMERIC,
  longitude NUMERIC,
  cap_rate NUMERIC,
  noi NUMERIC,
  gross_rent NUMERIC,
  vacancy_rate NUMERIC,
  show_in_vitrine BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vitrine properties"
  ON public.properties FOR SELECT
  USING (show_in_vitrine = true);

CREATE POLICY "Admins can do everything with properties"
  ON public.properties FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- VIEW: properties_public
-- ============================================
CREATE VIEW public.properties_public AS
  SELECT id, title, neighborhood, city, state, zip_code, property_type, status,
         price, area_total, area_built, bedrooms, bathrooms, parking_spots,
         description, features, images, latitude, longitude,
         cap_rate, noi, gross_rent, vacancy_rate, show_in_vitrine,
         created_at, updated_at
  FROM public.properties
  WHERE show_in_vitrine = true;

-- ============================================
-- VIEW: properties_authenticated
-- ============================================
CREATE VIEW public.properties_authenticated AS
  SELECT id, title, address, neighborhood, city, state, zip_code, property_type, status,
         price, area_total, area_built, bedrooms, bathrooms, parking_spots,
         description, features, images, latitude, longitude,
         cap_rate, noi, gross_rent, vacancy_rate, show_in_vitrine,
         created_at, updated_at
  FROM public.properties;

-- ============================================
-- TABLE: insight_authors
-- ============================================
CREATE TABLE public.insight_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insight_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view authors"
  ON public.insight_authors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage authors"
  ON public.insight_authors FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- TABLE: insight_tags
-- ============================================
CREATE TABLE public.insight_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insight_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON public.insight_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON public.insight_tags FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- TABLE: insights
-- ============================================
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_name TEXT,
  media_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published insights"
  ON public.insights FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage insights"
  ON public.insights FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
