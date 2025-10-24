import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function sb(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: Request){
  const url = new URL(req.url)
  const product = url.searchParams.get('product')!
  const s = sb()
  const { data } = await s
    .from('modifier_groups')
    .select('id,name,min_select,max_select,required, modifiers:modifiers(id,name,price_delta,sort_order) , product_links:product_modifier_groups!inner(product_id)')
    .eq('product_links.product_id', product)
    .order('name')
  return NextResponse.json(data||[])
}
