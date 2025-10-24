import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function sb(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
}

export async function GET(req: Request){
  const url = new URL(req.url)
  const shop = url.searchParams.get('shop')!
  const s = sb()
  const { data } = await s.from('v_sales_by_day').select('day_local,revenue').eq('shop_id', shop).order('day_local')
  const labels = (data||[]).map((r:any)=> r.day_local)
  const series = (data||[]).map((r:any)=> Number(r.revenue||0))
  return NextResponse.json({ labels, series })
}
