import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function sb(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
}

export async function GET(req: Request){
  const url = new URL(req.url)
  const shop = url.searchParams.get('shop')!
  const s = sb()
  const { data } = await s.rpc('exec_sql', { sql: `
    select coalesce(si.product_name_legacy, p.name) as name, sum(si.qty) as qty
    from sale_items si
    join sales s on s.id = si.sale_id
    left join products p on p.id = si.product_id
    where s.shop_id = '${shop}' and s.status = 'paid'
    group by 1 order by qty desc limit 10;
  `})
  // If RPC not available, fallback to direct query is not possible — keep this as data passthrough
  return NextResponse.json(data||[])
}
