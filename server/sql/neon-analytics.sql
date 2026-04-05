create table if not exists analytics_events (
  id bigserial primary key,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  context jsonb,
  page_path text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null,
  ip_address text,
  ip_hint text,
  geo jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_received_at_idx
  on analytics_events (received_at desc);

create index if not exists analytics_events_event_name_idx
  on analytics_events (event_name);

create index if not exists analytics_events_country_idx
  on analytics_events ((geo->>'country'));

create index if not exists analytics_events_city_idx
  on analytics_events ((geo->>'city'));