-- Contact / support messages from the public site and the logged-in dashboard.
-- Every message is stored here first, so nothing is lost if email delivery fails.
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT,
  message TEXT NOT NULL,
  source TEXT,
  emailed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_messages_email_created_idx
  ON public.contact_messages (lower(email), created_at DESC);

-- Internal table: RLS on and no policies, so only the service role can read or write.
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
