-- Little Wings Play School content and private school records.
-- Apply with Supabase SQL Editor or the Supabase CLI after creating a project.

create or replace function public.is_school_admin()
returns boolean
language sql stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.school_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  location text,
  image_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.school_highlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_path text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alt_text text not null,
  image_path text not null unique,
  sort_order integer not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  class_name text not null,
  enrollment_status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null,
  employment_status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.school_site_content (
  content_key text primary key,
  label text not null,
  area text not null,
  value_text text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nav_label text not null,
  title text not null,
  description text not null default '',
  body text not null default '',
  nav_order integer not null default 10,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.school_events enable row level security;
alter table public.school_highlights enable row level security;
alter table public.gallery_items enable row level security;
alter table public.students enable row level security;
alter table public.staff_members enable row level security;
alter table public.school_site_content enable row level security;
alter table public.custom_pages enable row level security;

revoke all on public.school_events, public.school_highlights, public.gallery_items, public.students, public.staff_members, public.school_site_content, public.custom_pages from anon, authenticated;
grant select on public.school_events, public.school_highlights, public.gallery_items, public.school_site_content, public.custom_pages to anon, authenticated;
grant select, insert, update, delete on public.school_events, public.school_highlights, public.gallery_items, public.students, public.staff_members, public.school_site_content, public.custom_pages to authenticated;

create policy "Public can read published events" on public.school_events for select to anon, authenticated using (is_published = true);
create policy "Admins manage events" on public.school_events for all to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
create policy "Public can read published highlights" on public.school_highlights for select to anon, authenticated using (is_published = true);
create policy "Admins manage highlights" on public.school_highlights for all to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
create policy "Public can read published gallery items" on public.gallery_items for select to anon, authenticated using (is_public = true);
create policy "Admins manage gallery items" on public.gallery_items for all to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
create policy "Only admins read student records" on public.students for select to authenticated using (public.is_school_admin());
create policy "Only admins create student records" on public.students for insert to authenticated with check (public.is_school_admin());
create policy "Only admins update student records" on public.students for update to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
create policy "Only admins delete student records" on public.students for delete to authenticated using (public.is_school_admin());
create policy "Only admins read staff records" on public.staff_members for select to authenticated using (public.is_school_admin());
create policy "Only admins create staff records" on public.staff_members for insert to authenticated with check (public.is_school_admin());
create policy "Only admins update staff records" on public.staff_members for update to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
create policy "Only admins delete staff records" on public.staff_members for delete to authenticated using (public.is_school_admin());
create policy "Public can read website copy" on public.school_site_content for select to anon, authenticated using (true);
create policy "Admins manage website copy" on public.school_site_content for all to authenticated using (public.is_school_admin()) with check (public.is_school_admin());
create policy "Public can read published extra pages" on public.custom_pages for select to anon, authenticated using (is_published = true);
create policy "Admins manage extra pages" on public.custom_pages for all to authenticated using (public.is_school_admin()) with check (public.is_school_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('school-images', 'school-images', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "Public can read published school images" on storage.objects for select to anon, authenticated
using (bucket_id = 'school-images' and (public.is_school_admin() or exists (
  select 1 from public.gallery_items g where g.image_path = storage.objects.name and g.is_public = true
)));
create policy "Admins upload school images" on storage.objects for insert to authenticated
with check (bucket_id = 'school-images' and public.is_school_admin());
create policy "Admins update school images" on storage.objects for update to authenticated
using (bucket_id = 'school-images' and public.is_school_admin()) with check (bucket_id = 'school-images' and public.is_school_admin());
create policy "Admins delete school images" on storage.objects for delete to authenticated
using (bucket_id = 'school-images' and public.is_school_admin());

-- Starter gallery rows reference the local, consent-safe classroom and materials photos.
insert into public.gallery_items (title, alt_text, image_path, sort_order, is_public) values
  ('Welcome to Little Wings', 'A welcoming Little Wings play and learning room', '/images/school-01.jpg', 0, true),
  ('Our play corner', 'A colourful play corner with a slide', '/images/school-07.jpg', 1, true),
  ('Little hands at work', 'Colourful hands-on number and shape learning materials', '/images/school-10.jpg', 2, true),
  ('Made with imagination', 'Children’s creative artwork displayed in the classroom', '/images/school-11.jpg', 3, true),
  ('Room to move', 'Play equipment in a bright classroom', '/images/school-12.jpg', 4, true),
  ('Our classroom', 'A classroom arranged for little learners', '/images/school-13.jpg', 5, true),
  ('Colours and shapes', 'Hands-on shapes and colour learning materials', '/images/school-14.jpg', 6, true),
  ('Ready to discover', 'A classroom activity and book shelf', '/images/school-15.jpg', 7, true)
on conflict (image_path) do nothing;
