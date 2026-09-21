alter table public."reported-incidents"
  alter column serial_number type text using serial_number::text,
  alter column last_seen type timestamptz using last_seen at time zone 'Europe/Amsterdam',
  alter column discovered_missing type timestamptz using discovered_missing at time zone 'Europe/Amsterdam',
  add column if not exists details text,
  add column if not exists share_aggregate boolean not null default false,
  add column if not exists longitude double precision,
  add column if not exists latitude double precision,
  add column if not exists created_at timestamptz not null default now();

alter table public."reported-incidents"
  alter column brand set not null,
  alter column type set not null,
  alter column color set not null,
  alter column location set not null,
  alter column last_seen set not null,
  alter column discovered_missing set not null,
  alter column neighbourhood set not null;

alter table public."reported-incidents"
  add constraint reported_incidents_brand_length check (char_length(brand) between 1 and 120),
  add constraint reported_incidents_type_allowed check (type in ('City bike', 'E-bike', 'Road bike', 'Cargo bike', 'Other')),
  add constraint reported_incidents_color_length check (char_length(color) between 1 and 120),
  add constraint reported_incidents_serial_length check (serial_number is null or char_length(serial_number) <= 120),
  add constraint reported_incidents_location_length check (char_length(location) between 1 and 200),
  add constraint reported_incidents_details_length check (details is null or char_length(details) <= 2000),
  add constraint reported_incidents_time_order check (discovered_missing >= last_seen),
  add constraint reported_incidents_coordinates check (
    longitude between 3.0 and 8.0 and latitude between 50.0 and 54.0
  );

revoke all on table public."reported-incidents" from anon, authenticated;

create or replace function public.submit_reported_incident(
  p_serial_number text,
  p_brand text,
  p_type text,
  p_color text,
  p_location text,
  p_last_seen timestamptz,
  p_discovered_missing timestamptz,
  p_neighbourhood text,
  p_details text,
  p_share_aggregate boolean,
  p_longitude double precision,
  p_latitude double precision
)
returns table (id bigint, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_last_seen > now() or p_discovered_missing > now() then
    raise exception 'Report times cannot be in the future';
  end if;

  if not exists (
    select 1
    from public."neighbourhood-data-2024" n
    where lower(n.neighbourhood) = lower(trim(p_neighbourhood))
  ) then
    raise exception 'Unknown Maastricht neighbourhood';
  end if;

  return query
  insert into public."reported-incidents" (
    serial_number, brand, type, color, location, last_seen, discovered_missing,
    neighbourhood, details, share_aggregate, longitude, latitude
  ) values (
    nullif(trim(p_serial_number), ''), trim(p_brand), p_type, trim(p_color), trim(p_location),
    p_last_seen, p_discovered_missing, trim(p_neighbourhood), nullif(trim(p_details), ''),
    p_share_aggregate, p_longitude, p_latitude
  )
  returning "reported-incidents".id, "reported-incidents".created_at;
end;
$$;

revoke all on function public.submit_reported_incident(
  text, text, text, text, text, timestamptz, timestamptz, text, text, boolean,
  double precision, double precision
) from public;

grant execute on function public.submit_reported_incident(
  text, text, text, text, text, timestamptz, timestamptz, text, text, boolean,
  double precision, double precision
) to anon, authenticated;
