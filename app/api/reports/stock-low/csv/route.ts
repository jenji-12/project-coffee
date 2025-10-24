import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data } = await s.from('v_low_stock').select('*').eq('shop_id', shop).order('product_name')
  const header = 'product,qty_on_hand,reorder_point,is_low\n'
  const csv = header + (data||[]).map((r:any)=>[r.product_name,r.quantity_on_hand||0,r.reorder_point||0,r.is_low].join(',')).join('\n')
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv','Content-Disposition':'attachment; filename="low_stock.csv"' } })
}
