-- defis_simple.sql
-- Simplified schema for Défis Mountain Valley
-- Table 1: defis_memberships (user_id -> group_number)
-- Table 2: defis_group_slots (group_number -> remaining slots)

create table if not exists public.defis_memberships (
  id bigserial primary key,
  user_id text not null unique,
  group_number int not null,
  created_at timestamptz default now()
);

create table if not exists public.defis_group_slots (
  group_number int primary key,
  remaining int not null
);

-- Initialize groups 1..75 with 5 remaining each
insert into public.defis_group_slots (group_number, remaining)
select gs, 5
from generate_series(1,75) gs
on conflict (group_number) do nothing;

-- RPC to join a group atomically
create or replace function public.defis_join_group(p_group_number int)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_claims json;
  v_user_id text;
  v_remaining int;
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

  -- prevent multiple memberships per user
  if exists(select 1 from public.defis_memberships where user_id = v_user_id) then
    return jsonb_build_object('status','already_in','message','User already in a group');
  end if;

  -- lock the group row to avoid race conditions
  select remaining into v_remaining from public.defis_group_slots where group_number = p_group_number for update;
  if v_remaining is null then
    return jsonb_build_object('status','error','message','Group not found');
  end if;

  if v_remaining <= 0 then
    return jsonb_build_object('status','full','message','Group is full');
  end if;

  insert into public.defis_memberships (user_id, group_number) values (v_user_id, p_group_number);
  update public.defis_group_slots set remaining = remaining - 1 where group_number = p_group_number;

  return jsonb_build_object('status','ok','message','Joined','group_number', p_group_number);
exception
  when unique_violation then
    return jsonb_build_object('status','conflict','message','Concurrent modification, try again');
  when others then
    return jsonb_build_object('status','error','message',sqlerrm);
end;
$$;

-- RPC to leave group atomically
create or replace function public.defis_leave_group()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_claims json;
  v_user_id text;
  v_group int;
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

  select group_number into v_group from public.defis_memberships where user_id = v_user_id;
  if v_group is null then
    return jsonb_build_object('status','not_in','message','User not in any group');
  end if;

  delete from public.defis_memberships where user_id = v_user_id;
  update public.defis_group_slots set remaining = remaining + 1 where group_number = v_group;

  return jsonb_build_object('status','ok','message','Left group');
exception
  when others then
    return jsonb_build_object('status','error','message',sqlerrm);
end;
$$;

-- RLS guidance: enable RLS on defis_memberships and allow select for authenticated users only.
-- Run these commands in Supabase SQL editor as an admin:
-- alter table public.defis_memberships enable row level security;
-- create policy "allow_select_authenticated" on public.defis_memberships for select using (auth.role() = 'authenticated');
-- alter table public.defis_group_slots enable row level security;
-- create policy "allow_select_groups_authenticated" on public.defis_group_slots for select using (auth.role() = 'authenticated');

