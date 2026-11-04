-- Security hardening (2026-11-05 audit).

-- 1) CRITICAL: browsers could UPDATE any column of their own profile row, including
--    subscription_status / subscription_ends_at / subscription_id, i.e. free Pro.
--    Browsers may now only edit display and mail-preference fields. Billing columns are
--    written by the service role (webhook, return route, admin routes).
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name, avatar_url, unsubscribed_at) ON public.profiles TO authenticated;
REVOKE INSERT, DELETE ON public.profiles FROM anon, authenticated;

-- 2) Defence in depth: anon gets no privileges on any table. Public share pages
--    (/resume/public/[id], /cover-letter/public/[id]) read through the server with the service
--    role by exact id, so the anon policy that let anyone list EVERY public resume (with
--    contact details and owner ids) through the REST API is removed.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
DROP POLICY IF EXISTS "Public resumes viewable by all" ON public.resumes;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM authenticated;
-- Internal, service-role-only tables.
REVOKE ALL ON public.email_queue, public.leads, public.contact_messages, public.checkout_attempts FROM authenticated;

-- 3) Trigger functions are not meant to be callable through the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_drip_emails() FROM PUBLIC, anon, authenticated;

-- 4) Quota counter: only logged-in users, only known features, only +1..+100
--    (a negative p_by let a user reset their own daily limit).
CREATE OR REPLACE FUNCTION public.bump_feature_usage(p_feature text, p_by integer DEFAULT 1)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF p_feature NOT IN ('ai_rewrite', 'job_match_view', 'auto_apply') THEN
    RAISE EXCEPTION 'unknown feature';
  END IF;
  IF p_by IS NULL OR p_by < 1 OR p_by > 100 THEN
    RAISE EXCEPTION 'invalid increment';
  END IF;
  INSERT INTO public.feature_usage (user_id, feature, day, count)
  VALUES (auth.uid(), p_feature, (now() AT TIME ZONE 'utc')::date, p_by)
  ON CONFLICT (user_id, feature, day)
  DO UPDATE SET count = public.feature_usage.count + p_by
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.bump_feature_usage(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bump_feature_usage(text, integer) TO authenticated;

-- 5) Avatars: images only, 5 MB max (matches the upload form).
UPDATE storage.buckets
   SET file_size_limit = 5242880,
       allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
 WHERE id = 'avatars';
