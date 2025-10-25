-- Roles mapping table (if not already)
-- create table shop_users (shop_id uuid references shops(id), user_id uuid, role text check (role in ('owner','manager','cashier')), created_at timestamptz default now(), primary key(shop_id,user_id));
-- enable RLS
alter table shop_users enable row level security;

drop policy if exists "read own memberships" on shop_users;
create policy "read own memberships" on shop_users
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "owners manage memberships" on shop_users;
create policy "owners manage memberships" on shop_users
for all to authenticated
using (exists (select 1 from shop_users su where su.shop_id = shop_users.shop_id and su.user_id = auth.uid() and su.role = 'owner'))
with check (exists (select 1 from shop_users su where su.shop_id = shop_users.shop_id and su.user_id = auth.uid() and su.role = 'owner'));

-- Audit logs
-- create table audit_logs (id uuid primary key default gen_random_uuid(), shop_id uuid, user_id uuid, action text, subject text, data jsonb, created_at timestamptz default now());
alter table audit_logs enable row level security;

drop policy if exists "read shop audit" on audit_logs;
create policy "read shop audit" on audit_logs
for select to authenticated
using (exists (select 1 from shop_users su where su.shop_id = audit_logs.shop_id and su.user_id = auth.uid()));

drop policy if exists "write shop audit via service role" on audit_logs;
create policy "write shop audit via service role" on audit_logs
for insert to public
with check (auth.role() = 'service_role');
