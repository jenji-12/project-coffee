import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PRODUCT_BUCKET = 'product-images'
function sbAdmin(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
}

export async function POST(req: Request){
  const { shop, productId, dataUrl } = await req.json()
  if(!shop || !productId || !dataUrl) return NextResponse.json({ error:'missing fields' }, { status: 400 })
  const s = sbAdmin()
  const b64 = String(dataUrl).split(',')[1]
  const bytes = Buffer.from(b64, 'base64')
  const path = `${shop}/${productId}/${Date.now()}.jpg`
  const { error } = await s.storage.from(PRODUCT_BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: true })
  if(error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { data: pub } = s.storage.from(PRODUCT_BUCKET).getPublicUrl(path)
  return NextResponse.json({ path, publicUrl: pub.publicUrl })
}
