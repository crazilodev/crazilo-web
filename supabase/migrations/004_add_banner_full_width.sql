-- Add is_full_width to banners table
alter table public.banners add column if not exists is_full_width boolean not null default false;
