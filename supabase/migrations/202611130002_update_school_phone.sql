insert into public.school_site_content (content_key, label, area, value_text)
values
  ('school.phone', 'School phone', 'school', '8888888888'),
  ('school.phone2', 'Secondary school phone', 'school', '')
on conflict (content_key) do update
set value_text = excluded.value_text,
    updated_at = now();
