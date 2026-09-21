-- Public aggregate endpoint for the theft heatmap layer.
-- Both source tables have `revoke all ... from anon, authenticated`, so reads only
-- happen through this SECURITY DEFINER function. It never returns raw rows: incidents
-- are grouped onto a coarse grid (~110m) and only a bin coordinate + count leaves the
-- database, so no single report's exact location or any personal detail is exposed.
-- Reported incidents are included only when the reporter opted in via share_aggregate;
-- police incidents are already public-record data, so all of them are included.
create or replace function public.get_theft_heatmap_points()
returns table (longitude double precision, latitude double precision, weight integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    round(longitude::numeric, 3)::double precision as longitude,
    round(latitude::numeric, 3)::double precision as latitude,
    count(*)::integer as weight
  from (
    select longitude, latitude
    from public."reported-incidents"
    where share_aggregate = true
      and longitude is not null
      and latitude is not null
    union all
    select longitude, latitude
    from public."police-incidents"
    where longitude is not null
      and latitude is not null
  ) incidents
  group by 1, 2;
$$;

revoke all on function public.get_theft_heatmap_points() from public;

grant execute on function public.get_theft_heatmap_points() to anon, authenticated;
