-- Parkings holds only public bicycle-parking facility info (name, address, capacity,
-- hours) — no personal data — so, unlike the incident tables, it's safe to read directly
-- with the anon key. RLS was already enabled with no policies (default-deny), so anon
-- reads were silently returning zero rows; this adds the missing read policy.
--
-- The table also had full INSERT/UPDATE/DELETE/TRUNCATE grants open to anon and
-- authenticated with no matching policies. That's currently harmless (RLS still denies
-- those commands with no policy for them) but is unnecessary surface area for a
-- read-only reference table, so it's revoked down to what the app actually needs.
create policy "Parkings are publicly readable"
  on public."Parkings"
  for select
  to anon, authenticated
  using (true);

revoke insert, update, delete, truncate on public."Parkings" from anon, authenticated;
