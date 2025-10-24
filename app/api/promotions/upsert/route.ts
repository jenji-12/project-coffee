import { NextResponse } from 'next/server'
import { upsertPromotion } from '@/app/(back)/promotions/actions'
export async function POST(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const form = await req.formData()
  await upsertPromotion(shop, form)
  return NextResponse.json({ ok:true })
}
