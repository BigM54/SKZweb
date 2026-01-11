-- mv_schema.sql
-- Tables, view and RPCs for Monthey Valley groups (50 groups, 5 places each)

-- 1) Tables
create table if not exists public.mv_groups (
  id serial primary key,
  group_number int not null unique,
  capacity int not null default 5,
  created_at timestamptz default now()
);

create table if not exists public.mv_memberships (
  id bigserial primary key,
  user_id text not null,
  group_number int not null references public.mv_groups(group_number) on delete cascade,
  created_at timestamptz default now(),
  constraint mv_unique_user unique (user_id)
);

create index if not exists idx_mv_memberships_group_number on public.mv_memberships (group_number);

-- 2) Initialize groups 1..50
insert into public.mv_groups (group_number, capacity)
select gs, 5
from generate_series(1,50) gs
on conflict (group_number) do nothing;

-- 3) View: status per group
create or replace view public.mv_groups_status as
select
  g.group_number,
  g.capacity,
  coalesce(count(m.*), 0) as occupied,
  g.capacity - coalesce(count(m.*), 0) as remaining
from public.mv_groups g
left join public.mv_memberships m on m.group_number = g.group_number
group by g.group_number, g.capacity
order by g.group_number;

-- 4) RPC join/leave
create or replace function public.mv_join_group(p_group_number int)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_claims json;
  v_user_id text;
  v_capacity int;
  v_count int;
begin
  begin
    v_claims := current_setting('request.jwt.claims', true)::json;
  exception when others then
    return jsonb_build_object('status','error','message','Unauthorized or no jwt claims');
  end;

  v_user_id := (v_claims ->> 'sub');
  if v_user_id is null then
    return jsonb_build_object('status','error','message','Unauthorized: no user id');
  end if;

  if exists(select 1 from public.mv_memberships where user_id = v_user_id) then
    return jsonb_build_object('status','already_in','message','User already in a group');
  end if;

  select capacity into v_capacity from public.mv_groups where group_number = p_group_number;
  if v_capacity is null then
    return jsonb_build_object('status','error','message','Group not found');
  end if;

  select count(*) into v_count from public.mv_memberships where group_number = p_group_number;

  if v_count >= v_capacity then
    return jsonb_build_object('status','full','message','Group is full');
  end if;

  insert into public.mv_memberships (user_id, group_number)
  values (v_user_id, p_group_number);

  return jsonb_build_object('status','ok','message','Joined','group_number', p_group_number);
exception
  when unique_violation then
    return jsonb_build_object('status','conflict','message','Concurrent modification, try again');
  when others then
    return jsonb_build_object('status','error','message',sqlerrm);
end;
$$;

create or replace function public.mv_leave_group()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_claims json;
  v_user_id text;
  v_deleted int;
begin
  begin
    v_claims := current_setting('request.jwt.claims', true)::json;
  exception when others then
    return jsonb_build_object('status','error','message','Unauthorized or no jwt claims');
  end;

  v_user_id := (v_claims ->> 'sub');
  if v_user_id is null then
    return jsonb_build_object('status','error','message','Unauthorized: no user id');
  end if;

  delete from public.mv_memberships where user_id = v_user_id
  returning 1 into v_deleted;

  if v_deleted is null then
    return jsonb_build_object('status','not_in','message','User was not in any group');
  end if;

  return jsonb_build_object('status','ok','message','Left group');
exception
  when others then
    return jsonb_build_object('status','error','message',sqlerrm);
end;
$$;

-- 5) RLS guidance (run in SQL editor as admin)
-- alter table public.mv_memberships enable row level security;
-- create policy "allow_select_for_authenticated" on public.mv_memberships
--   for select using (auth.role() = 'authenticated');
-- do NOT create insert/update/delete policies so clients must use the RPC functions

*** End Patch