-- Storage Policies for bucket: product-images
-- Strategy: public read; writes only via service role (our API routes use service role)
-- This avoids leaking write access from clients while keeping CDN-friendly reads.

-- Pre-req: bucket 'product-images' exists and is public
-- Supabase SQL editor:

-- Allow public read
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

-- Allow write only by service role
drop policy if exists "Service role write product images" on storage.objects;
create policy "Service role write product images"
on storage.objects for all
to public
using ( bucket_id = 'product-images' and auth.role() = 'service_role' )
with check ( bucket_id = 'product-images' and auth.role() = 'service_role' );
