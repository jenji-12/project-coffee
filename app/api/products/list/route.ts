import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function GET(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data } = await s.from('products').select('id,name,price,category_id').eq('shop_id', shop).eq('is_active', true).order('name')
  return NextResponse.json(data||[])
}
