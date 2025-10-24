import { NextResponse } from 'next/server'
import { sbAdmin, PRODUCT_BUCKET } from '@/lib/storage'

export async function POST(req: Request){
  const s = sbAdmin()
  const form = await req.formData()
  const file = form.get('file') as File | null
  const shop = String(form.get('shop') || 'default')
  const productId = String(form.get('productId') || 'unknown')
  if(!file) return NextResponse.json({ error: 'no file' }, { status: 400 })
  const ext = (file.name.split('.').pop()||'png').toLowerCase()
  const path = `${shop}/${productId}/${Date.now()}.${ext}`
  const { data, error } = await s.storage.from(PRODUCT_BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true })
  if(error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { data: pub } = s.storage.from(PRODUCT_BUCKET).getPublicUrl(path)
  return NextResponse.json({ path, publicUrl: pub.publicUrl })
}
