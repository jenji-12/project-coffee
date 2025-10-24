import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const form = await req.formData(); const file = form.get('file') as File|null
  if(!file) return NextResponse.json({ error:'missing file' }, { status: 400 })
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(Boolean)
  const header = lines.shift()?.split(',')||[]
  const nameIdx = header.indexOf('name'), phoneIdx = header.indexOf('phone'), pointsIdx = header.indexOf('points'), cupsIdx = header.indexOf('cups_bought')
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })

  const ok:any[] = [], bad:any[] = []
  for(const [ln, line] of lines.entries()){
    const cols = line.split(',')
    const row:any = { shop_id: shop, name: cols[nameIdx]?.trim(), phone: cols[phoneIdx]||null, points: Number(cols[pointsIdx]||0), cups_bought: Number(cols[cupsIdx]||0) }
    if(!row.name){ bad.push({ line: ln+2, error:'name required' }); continue }
    const { error } = await s.from('members').upsert(row)
    if(error) bad.push({ line: ln+2, error: error.message }); else ok.push(row.name)
  }
  return NextResponse.json({ ok: ok.length, bad })
}
