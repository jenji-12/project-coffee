import { createClient } from '@supabase/supabase-js'

export const PRODUCT_BUCKET = 'product-images'

export function sbAdmin(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE!
  return createClient(url, key, { auth: { persistSession: false } })
}

export function sbAnon(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}
