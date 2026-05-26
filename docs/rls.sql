-- Run in Supabase SQL Editor after migrations (defense in depth)
-- Prisma uses DATABASE_URL with service role; RLS protects direct client access.

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid()::text = user_id);
