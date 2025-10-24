import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data } = await s.from('v_sales_by_day').select('*').eq('shop_id', shop).order('day_local')
  const header = 'shop_id,day_local,orders,revenue,subtotal,tax,discount\n'
  const csv = header + (data||[]).map((r:any)=>[r.shop_id,r.day_local,r.orders,r.revenue,r.subtotal,r.tax,r.discount].join(',')).join('\n')
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv','Content-Disposition':'attachment; filename="sales_by_day.csv"' } })
}
