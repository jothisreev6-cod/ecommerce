-- Prabavathi Fragrance: tables, Row Level Security, owner check, storage.  Run once in Supabase > SQL Editor.
-- Owner = the confirmed Supabase Auth user with this email. Checked inside the database, not in the browser.

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.users u
    where u.id = auth.uid() and lower(u.email) = 'jothisreev@gmail.com' and u.email_confirmed_at is not null);
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),                       -- single row
  free_ship int not null default 499 check (free_ship between 0 and 1000000),
  ship_fee int not null default 40 check (ship_fee between 0 and 10000),
  favourites_enabled boolean not null default true,
  company jsonb not null default '{}' check (jsonb_typeof(company) = 'object'),
  hero jsonb not null default '{}' check (jsonb_typeof(hero) = 'object'),
  flash jsonb not null default '{}' check (jsonb_typeof(flash) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  category text not null check (category in ('Cup Sambarani','Agarbathi','Dhoop & Cones','Pooja Essentials')),
  name text not null check (char_length(name) between 1 and 120),
  tamil_name text not null default '' check (char_length(tamil_name) <= 160),
  description text not null default '' check (char_length(description) <= 400),
  badge text not null default '' check (char_length(badge) <= 30),
  hue int not null default 20 check (hue between 0 and 360),
  image_url text not null default '' check (image_url = '' or image_url ~* '^(https://[^\s"''<>]{1,480}|[A-Za-z0-9._-]+\.(jpe?g|png|webp|gif))$'),
  variants jsonb not null check (jsonb_typeof(variants) = 'array' and jsonb_array_length(variants) between 1 and 12),
  available boolean not null default true,
  featured boolean not null default false,
  favourite boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.products enable row level security;
revoke insert, update, delete, truncate on public.site_settings, public.products from anon;

create policy "anyone can read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "anyone can read products" on public.products for select to anon, authenticated using (true);
create policy "owner manages settings" on public.site_settings for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages products" on public.products for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- One atomic "Save Changes" used by the dashboard (SECURITY INVOKER: RLS above still applies, plus an explicit owner check).
create or replace function public.save_site(p jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_owner() then raise exception 'Owner permission required' using errcode = '42501'; end if;
  update public.site_settings set free_ship = (p#>>'{settings,freeShip}')::int, ship_fee = (p#>>'{settings,shipFee}')::int,
    favourites_enabled = coalesce((p#>>'{favourites,enabled}')::boolean, true), company = p->'company', hero = p->'hero', flash = p->'flash', updated_at = now() where id = 1;
  delete from public.products where id <> all (select x->>'id' from jsonb_array_elements(p->'products') x);
  insert into public.products (id, category, name, tamil_name, description, badge, hue, image_url, variants, available, featured, favourite, sort)
  select x->>'id', x->>'c', x->>'name', coalesce(x->>'ta',''), coalesce(x->>'frag',''), coalesce(x->>'badge',''), coalesce((x->>'h')::int,20), coalesce(x->>'img',''),
         x->'v', coalesce((x->>'available')::boolean,true), coalesce((x->>'featured')::boolean,false), coalesce((x->>'favourite')::boolean,false), (t.ord-1)::int
  from jsonb_array_elements(p->'products') with ordinality as t(x, ord)
  on conflict (id) do update set category = excluded.category, name = excluded.name, tamil_name = excluded.tamil_name, description = excluded.description, badge = excluded.badge,
    hue = excluded.hue, image_url = excluded.image_url, variants = excluded.variants, available = excluded.available, featured = excluded.featured, favourite = excluded.favourite, sort = excluded.sort;
end $$;
revoke all on function public.save_site(jsonb) from public, anon;
grant execute on function public.save_site(jsonb) to authenticated;

-- Image storage: public bucket (anyone can view images), only the owner can upload / change / delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
create policy "owner uploads images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images' and public.is_owner());
create policy "owner reads images" on storage.objects for select to authenticated using (bucket_id = 'site-images' and public.is_owner());
create policy "owner updates images" on storage.objects for update to authenticated using (bucket_id = 'site-images' and public.is_owner()) with check (bucket_id = 'site-images' and public.is_owner());
create policy "owner deletes images" on storage.objects for delete to authenticated using (bucket_id = 'site-images' and public.is_owner());
