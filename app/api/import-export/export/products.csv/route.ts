import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function GET(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data=[] } = await s.from('products').select('name,price,sku,image_path,is_active').eq('shop_id', shop).order('name')
  const rows = (data||[]).map((r:any)=> [r.name, r.price, r.sku||'', r.image_path||'', r.is_active?'true':'false'].join(','))
  const csv = 'name,price,sku,image_path,is_active\n' + rows.join('\n')
  return new NextResponse(csv, { headers:{ 'Content-Type':'text/csv', 'Content-Disposition':'attachment; filename="products.csv"' } })
}
