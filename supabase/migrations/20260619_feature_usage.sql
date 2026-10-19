-- Per-user daily usage counters for Free plan limits (AI rewrites, job match views).
CREATE TABLE IF NOT EXISTS public.feature_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  day     DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, feature, day)
);

ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_usage_select_own" ON public.feature_usage;
CREATE POLICY "feature_usage_select_own" ON public.feature_usage
  FOR SELECT USING (auth.uid() = user_id);
-- No direct INSERT/UPDATE policies: writes go through bump_feature_usage().

CREATE OR REPLACE FUNCTION public.bump_feature_usage(p_feature TEXT, p_by INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  INSERT INTO public.feature_usage (user_id, feature, day, count)
  VALUES (auth.uid(), p_feature, (now() AT TIME ZONE 'utc')::date, p_by)
  ON CONFLICT (user_id, feature, day)
  DO UPDATE SET count = public.feature_usage.count + p_by
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bump_feature_usage(TEXT, INTEGER) TO authenticated;

-- Record which upgrade moment started a checkout.
ALTER TABLE IF EXISTS public.checkout_attempts
  ADD COLUMN IF NOT EXISTS trigger TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT;
