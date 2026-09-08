-- ============================================================
-- FIX: Allow guest messages to be inserted (RLS policy)
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1) Make sure RLS is on (idempotent, safe to re-run)
alter table public.messages enable row level security;

-- 2) Allow ANYONE (anon/publishable key) to ADD a message.
--    Only insert is opened; admin GET keeps working as-is.
drop policy if exists "public can insert" on public.messages;
create policy "public can insert" on public.messages
  for insert with check (true);

-- 3) Sanity check: does your WEDDING_ID exist in the weddings table?
--    If this returns ZERO rows, add your wedding first, because
--    messages.wedding_id references weddings(id).
--    (Change the UUID to match your .env WEDDING_ID)
select * from weddings where id = 'd6d2bfb7-f13e-4eae-83c1-6344968ff3b4';