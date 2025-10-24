import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applyPromotions } from '@/lib/promotions/engine'

export async function POST(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const body = await req.json()
  const items = (body?.items||[]).map((it:any)=> ({ id:'tmp', product_id: it.product_id, qty: it.qty, unit_price: it.unit_price, line_discount: it.line_discount||0, line_total: (it.qty*it.unit_price)-(it.line_discount||0), category_id: it.category_id||null }))

  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data: promos=[] } = await s.from('promotions').select('*').eq('shop_id', shop).eq('is_active', true)
  const res = applyPromotions(promos as any, items)
  const subtotal = items.reduce((a:any,c:any)=> a + c.qty*c.unit_price - (c.line_discount||0), 0)
  const total = Math.max(0, subtotal - res.orderDiscount)
  return NextResponse.json({ ...res, subtotal, total })
}
