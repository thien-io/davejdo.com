create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- Attach to every table that has an updated_at column.
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

create trigger photos_touch before update on public.photos
  for each row execute function public.touch_updated_at();

create trigger movies_touch before update on public.movies
  for each row execute function public.touch_updated_at();
