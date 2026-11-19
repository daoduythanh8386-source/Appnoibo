-- ORISTAR: lược đồ Supabase. Chạy toàn bộ tệp này một lần trong SQL Editor.
create extension if not exists pgcrypto;

-- Hồ sơ đăng nhập (liên kết với auth.users). role: admin hoặc member.
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  email text, name text,
  role text not null default 'member' check (role in ('admin','member')),
  disabled boolean not null default false,
  created_at timestamptz not null default now());
alter table public.profiles enable row level security;

create or replace function public.my_level() returns int
language sql stable security definer set search_path=public as $$
  select coalesce((select case when disabled then 0 when role='admin' then 3 else 2 end from public.profiles where id=auth.uid()),0) $$;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (id=auth.uid() or public.my_level()=3);

-- Bảng quy tắc quyền theo đường dẫn: r = mức đọc, w = mức ghi (1 xem, 2 người dùng, 3 quản trị)
create table if not exists public.rules(path text primary key, r int not null, w int not null);
alter table public.rules enable row level security;
delete from public.rules;
insert into public.rules(path,r,w) values
 ('',3,3),
 ('staff',3,3),('staff/{self}',1,3),
 ('claims',3,3),('claims/{self}',1,2),
 ('holidays',1,3),('settings',1,3),('locations',1,3),('assets',1,3),
 ('scans',1,2),
 ('items',3,3),('stockTx',3,3),('issueLog',3,3),
 ('issues',3,3),('issues/{self}',1,3),
 ('signs',3,3),('signs/{self}',1,2),
 ('directory',1,3),
 ('team',3,3),('team/{self}',1,3),
 ('chatrooms',1,2),('chatmsg',1,2),('dm',1,2),
 ('audit',3,3),
 ('mirrorIndex',3,3),
 ('stockEv',3,3),('stocktakes',3,3),
 ('board',1,2),('boardEv',1,2),('boardmsg',1,2);

create or replace function public.rule_ok(p text, need_write boolean) returns boolean
language plpgsql stable security definer set search_path=public as $$
declare top text:=split_part(p,'/',1); seg text:=split_part(p,'/',2); lv int:=public.my_level(); rr record;
begin
  if lv=0 then return false; end if;
  select * into rr from public.rules where path=top||'/{self}' and seg=auth.uid()::text;
  if not found then select * into rr from public.rules where path=top; end if;
  if not found then select * into rr from public.rules where path=''; end if;
  return lv >= case when need_write then rr.w else rr.r end;
end $$;

-- Kho tài liệu dùng chung
create table if not exists public.docs(
  path text primary key,
  coll text not null, id text not null,
  data jsonb not null default '{}'::jsonb,
  ver int not null default 1,
  ord numeric generated always as (
    case when data->>'t' ~ '^-?[0-9]+(\.[0-9]+)?$' then (data->>'t')::numeric
         when data->>'at' ~ '^-?[0-9]+(\.[0-9]+)?$' then (data->>'at')::numeric end) stored,
  updated_at timestamptz not null default now());
create index if not exists docs_coll_ord on public.docs(coll, ord);
create index if not exists docs_coll_id on public.docs(coll, id);

create or replace function public.docs_guard() returns trigger language plpgsql as $$
begin
  if new.path !~ '^[A-Za-z0-9_.~:@+-]+(/[A-Za-z0-9_.~:@+-]+)+$' or (length(new.path)-length(replace(new.path,'/','')))%2=0 then
    raise exception 'duong dan khong hop le'; end if;
  if octet_length(new.data::text)>262144 then raise exception 'tai lieu qua lon'; end if;
  new.id:=regexp_replace(new.path,'^.*/','');
  new.coll:=regexp_replace(new.path,'/[^/]*$','');
  if tg_op='UPDATE' then new.ver:=old.ver+1; end if;
  new.updated_at:=now();
  return new;
end $$;
drop trigger if exists docs_guard on public.docs;
create trigger docs_guard before insert or update on public.docs for each row execute function public.docs_guard();

alter table public.docs enable row level security;
drop policy if exists docs_s on public.docs; drop policy if exists docs_i on public.docs;
drop policy if exists docs_u on public.docs; drop policy if exists docs_d on public.docs;
create policy docs_s on public.docs for select to authenticated using (public.rule_ok(path,false));
create policy docs_i on public.docs for insert to authenticated with check (public.rule_ok(path,true));
create policy docs_u on public.docs for update to authenticated using (public.rule_ok(path,true)) with check (public.rule_ok(path,true));
create policy docs_d on public.docs for delete to authenticated using (public.rule_ok(path,true));
revoke all on public.docs, public.profiles, public.rules from anon;

-- Gộp sâu một phần dữ liệu vào tài liệu (hỗ trợ {"__delete__":true} để xóa trường)
create or replace function public.jsonb_deep_merge(a jsonb, b jsonb) returns jsonb
language plpgsql immutable as $$
declare k text; v jsonb; res jsonb:=coalesce(a,'{}'::jsonb);
begin
  if jsonb_typeof(b)<>'object' then return b; end if;
  if jsonb_typeof(res)<>'object' then res:='{}'::jsonb; end if;
  for k,v in select * from jsonb_each(b) loop
    if jsonb_typeof(v)='object' and v ? '__delete__' then res:=res-k;
    elsif jsonb_typeof(v)='object' and jsonb_typeof(res->k)='object' then res:=jsonb_set(res,array[k],public.jsonb_deep_merge(res->k,v));
    else res:=jsonb_set(res,array[k],v); end if;
  end loop;
  return res;
end $$;

create or replace function public.merge_doc(p text, patch jsonb) returns void
language plpgsql security invoker set search_path=public as $$
begin
  update public.docs set data=public.jsonb_deep_merge(data,patch) where path=p;
  if not found then raise exception 'khong tim thay tai lieu hoac khong co quyen'; end if;
end $$;
grant execute on function public.merge_doc(text,jsonb) to authenticated;

-- Cập nhật tức thời
alter table public.docs replica identity full;
do $$ begin
  begin alter publication supabase_realtime add table public.docs; exception when duplicate_object then null; end;
end $$;

-- Kho ảnh chat: tối đa 5 MB mỗi ảnh
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('chat','chat',true,5242880,array['image/jpeg','image/png','image/webp','image/gif','image/heic'])
on conflict (id) do update set file_size_limit=5242880, allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "chat_upload" on storage.objects;
create policy "chat_upload" on storage.objects for insert to authenticated
  with check (bucket_id='chat' and (storage.foldername(name))[1]=auth.uid()::text and public.my_level()>=2);

-- ====== TẠO QUẢN TRỊ VIÊN ĐẦU TIÊN ======
-- 1) Authentication > Users > Add user: nhập email và mật khẩu của bạn (tick Auto Confirm User).
-- 2) Chạy lệnh dưới đây (đổi email):
-- insert into public.profiles(id,email,name,role) select id,email,'Quản trị viên','admin' from auth.users where email='email-cua-ban@gmail.com' on conflict (id) do update set role='admin';
