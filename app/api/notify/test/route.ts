import { NextResponse } from 'next/server'
import { lineNotify } from '@/lib/lineNotify'

export async function GET(req: Request){
  const url = new URL(req.url)
  const shop = url.searchParams.get('shop')!
  const msg = url.searchParams.get('msg') || 'ทดสอบแจ้งเตือนจาก Waibon POS ✅'
  if(!shop) return NextResponse.json({ ok:false, error:'missing shop' }, { status: 400 })
  const r = await lineNotify(shop, msg)
  return NextResponse.json(r, { status: r.ok ? 200 : 500 })
}
