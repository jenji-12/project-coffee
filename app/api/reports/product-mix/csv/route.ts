import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data } = await s.rpc('exec_sql', { sql: `
    select coalesce(si.product_name_legacy, p.name) as product, sum(si.qty) as qty, sum(si.line_total) as amount
    from sale_items si join sales s on s.id = si.sale_id
    left join products p on p.id = si.product_id
    where s.shop_id = '${shop}' and s.status='paid'
    group by 1 order by qty desc;
  `})
  const header = 'product,qty,amount\n'
  const csv = header + (data||[]).map((r:any)=>[r.product,r.qty,r.amount].join(',')).join('\n')
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv','Content-Disposition':'attachment; filename="product_mix.csv"' } })
}
