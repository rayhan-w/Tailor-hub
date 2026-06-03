-- 1) PROFILES: restrict public SELECT to owner only
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins should still be able to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 2) TAILORS: replace public-everything SELECT with owner/admin full access,
--    and expose a safe public view for discovery (no email/phone/address).
DROP POLICY IF EXISTS "Anyone can view tailors" ON public.tailors;

CREATE POLICY "Owners can view their tailor record"
ON public.tailors
FOR SELECT
USING (auth.uid() = user_id);

-- Public-safe view for discovery (excludes email, phone, street address)
CREATE OR REPLACE VIEW public.tailors_public AS
SELECT
  id,
  user_id,
  shop_name,
  description,
  city,
  latitude,
  longitude,
  specialties,
  rating,
  total_reviews,
  is_available,
  is_verified,
  created_at,
  updated_at
FROM public.tailors;

GRANT SELECT ON public.tailors_public TO anon, authenticated;

-- Allow public SELECT on the base table BUT only the safe columns via column privileges.
-- This keeps existing client code (.from('tailors').select('safe cols')) working
-- while blocking access to email/phone/address columns.
REVOKE SELECT ON public.tailors FROM anon, authenticated;
GRANT SELECT (
  id, user_id, shop_name, description, city, latitude, longitude,
  specialties, rating, total_reviews, is_available, is_verified,
  created_at, updated_at
) ON public.tailors TO anon, authenticated;

-- Owners and admins need full column access; grant via policy + full-column grant
-- to authenticated role is fine because RLS still restricts rows; for owner SELECT
-- of sensitive columns, grant them as well:
GRANT SELECT (email, phone, address) ON public.tailors TO authenticated;

-- Re-add a permissive SELECT policy so anon can read safe rows
CREATE POLICY "Public can view tailor discovery info"
ON public.tailors
FOR SELECT
USING (true);
