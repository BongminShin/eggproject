-- ============================================================
-- egg — NZ Local Marketplace
-- Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 0. Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. Helpers
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 2. profiles
-- (auto-created on signup via trigger)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text,
  avatar_url    text,
  bio           text,
  suburb        text,
  city          text default 'Auckland',
  rating_avg    numeric(3,2) default 0,
  rating_count  integer default 0,
  is_verified   boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function handle_updated_at();

-- Auto-create profile row when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "profiles_read_all"
  on public.profiles for select using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- 3. categories
-- ============================================================
create table public.categories (
  id          serial primary key,
  slug        text unique not null,
  label       text not null,
  icon        text not null,
  sort_order  integer default 0
);

alter table public.categories enable row level security;

create policy "categories_read_all"
  on public.categories for select using (true);

-- Seed
insert into public.categories (slug, label, icon, sort_order) values
  ('electronics',  'Electronics',    'Laptop',          1),
  ('furniture',    'Furniture',      'Sofa',            2),
  ('clothing',     'Clothing',       'Shirt',           3),
  ('vehicles',     'Vehicles',       'Car',             4),
  ('sports',       'Sports',         'Dumbbell',        5),
  ('books',        'Books',          'BookOpen',        6),
  ('tools',        'Tools',          'Wrench',          7),
  ('garden',       'Garden',         'Flower2',         8),
  ('toys',         'Toys & Kids',    'Baby',            9),
  ('food',         'Food & Produce', 'Apple',          10),
  ('services',     'Services',       'Briefcase',      11),
  ('free',         'Free Stuff',     'Gift',           12),
  ('other',        'Other',          'MoreHorizontal', 13);

-- ============================================================
-- 4. listings
-- ============================================================
create type listing_status as enum ('active', 'sold', 'reserved', 'hidden');
create type listing_condition as enum ('new', 'like_new', 'good', 'fair', 'poor');

create table public.listings (
  id            uuid primary key default uuid_generate_v4(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  category_id   integer not null references public.categories(id),
  title         text not null,
  description   text,
  price         integer not null default 0,  -- NZD cents; 0 = free
  is_free       boolean generated always as (price = 0) stored,
  condition     listing_condition not null default 'good',
  suburb        text,
  city          text default 'Auckland',
  images        text[] default '{}',
  status        listing_status not null default 'active',
  view_count    integer not null default 0,
  like_count    integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index listings_seller_id_idx   on public.listings(seller_id);
create index listings_category_id_idx on public.listings(category_id);
create index listings_status_idx      on public.listings(status);
create index listings_created_at_idx  on public.listings(created_at desc);

create trigger listings_updated_at
  before update on public.listings
  for each row execute function handle_updated_at();

alter table public.listings enable row level security;

create policy "listings_read_active"
  on public.listings for select
  using (status = 'active' or auth.uid() = seller_id);

create policy "listings_insert_authenticated"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "listings_update_own"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "listings_delete_own"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- ============================================================
-- 5. listing_likes
-- ============================================================
create table public.listing_likes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

alter table public.listing_likes enable row level security;

create policy "listing_likes_read"
  on public.listing_likes for select using (true);

create policy "listing_likes_insert_own"
  on public.listing_likes for insert
  with check (auth.uid() = user_id);

create policy "listing_likes_delete_own"
  on public.listing_likes for delete
  using (auth.uid() = user_id);

-- Keep like_count in sync
create or replace function sync_listing_like_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.listings set like_count = like_count + 1 where id = new.listing_id;
  elsif TG_OP = 'DELETE' then
    update public.listings set like_count = greatest(like_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger listing_likes_sync
  after insert or delete on public.listing_likes
  for each row execute function sync_listing_like_count();

-- ============================================================
-- 6. messages
-- ============================================================
create table public.messages (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid not null references public.listings(id) on delete cascade,
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  body         text not null,
  is_read      boolean default false,
  created_at   timestamptz default now()
);

create index messages_listing_sender_idx   on public.messages(listing_id, sender_id);
create index messages_listing_receiver_idx on public.messages(listing_id, receiver_id);
create index messages_receiver_unread_idx  on public.messages(receiver_id, is_read) where is_read = false;

alter table public.messages enable row level security;

create policy "messages_read_own"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "messages_insert"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "messages_update_read"
  on public.messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- ============================================================
-- 7. community_posts
-- ============================================================
create type community_post_type as enum (
  'general', 'lost_found', 'event', 'recommendation', 'warning'
);

create table public.community_posts (
  id            uuid primary key default uuid_generate_v4(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  post_type     community_post_type not null default 'general',
  title         text not null,
  body          text not null,
  images        text[] default '{}',
  suburb        text,
  city          text default 'Auckland',
  like_count    integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index community_posts_author_idx  on public.community_posts(author_id);
create index community_posts_created_idx on public.community_posts(created_at desc);
create index community_posts_type_idx    on public.community_posts(post_type);

create trigger community_posts_updated_at
  before update on public.community_posts
  for each row execute function handle_updated_at();

alter table public.community_posts enable row level security;

create policy "community_posts_read_all"
  on public.community_posts for select using (true);

create policy "community_posts_insert_authenticated"
  on public.community_posts for insert
  with check (auth.uid() = author_id);

create policy "community_posts_update_own"
  on public.community_posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "community_posts_delete_own"
  on public.community_posts for delete
  using (auth.uid() = author_id);

-- ============================================================
-- 8. community_comments
-- ============================================================
create table public.community_comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz default now()
);

create index community_comments_post_idx on public.community_comments(post_id, created_at);

alter table public.community_comments enable row level security;

create policy "community_comments_read_all"
  on public.community_comments for select using (true);

create policy "community_comments_insert_authenticated"
  on public.community_comments for insert
  with check (auth.uid() = author_id);

create policy "community_comments_delete_own"
  on public.community_comments for delete
  using (auth.uid() = author_id);

-- Keep comment_count in sync
create or replace function sync_community_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.community_posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.community_posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger community_comments_sync
  after insert or delete on public.community_comments
  for each row execute function sync_community_comment_count();

-- ============================================================
-- 9. Storage buckets
-- (Run separately in Supabase Dashboard → Storage)
-- ============================================================
-- Bucket: "listing-images"  → public, max 5MB, image/*
-- Bucket: "avatars"         → public, max 2MB, image/*
-- Bucket: "community-images"→ public, max 5MB, image/*

-- Storage policies (after creating buckets):
insert into storage.buckets (id, name, public) values
  ('listing-images',   'listing-images',   true),
  ('avatars',          'avatars',          true),
  ('community-images', 'community-images', true)
on conflict (id) do nothing;

create policy "listing_images_read"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing_images_upload"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "listing_images_delete_own"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars_update_own"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "community_images_read"
  on storage.objects for select
  using (bucket_id = 'community-images');

create policy "community_images_upload"
  on storage.objects for insert
  with check (bucket_id = 'community-images' and auth.role() = 'authenticated');

-- ============================================================
-- Done!
-- Tables: profiles, categories, listings, listing_likes,
--         messages, community_posts, community_comments
-- ============================================================
