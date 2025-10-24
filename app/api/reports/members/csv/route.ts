import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data } = await s.from('members').select('name,phone,cups_bought,points,created_at').eq('shop_id', shop).order('created_at', { ascending: false })
  const header = 'name,phone,cups_bought,points,created_at\n'
  const csv = header + (data||[]).map((r:any)=>[r.name,r.phone||'',r.cups_bought||0,r.points||0,r.created_at].join(',')).join('\n')
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv','Content-Disposition':'attachment; filename="members.csv"' } })
}
