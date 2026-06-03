GRANT SELECT (phone) ON public.tailors TO anon, authenticated;

DROP VIEW IF EXISTS public.tailors_public;
CREATE VIEW public.tailors_public AS
SELECT
  id, user_id, shop_name, description, city, latitude, longitude,
  specialties, rating, total_reviews, is_available, is_verified,
  phone, created_at, updated_at
FROM public.tailors;

ALTER VIEW public.tailors_public SET (security_invoker = true);
GRANT SELECT ON public.tailors_public TO anon, authenticated;