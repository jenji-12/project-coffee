import { NextResponse } from 'next/server'
import { sbAdmin, PRODUCT_BUCKET } from '@/lib/storage'

export async function GET(){
  const s = sbAdmin()
  // Create bucket if not exists
  const { data: buckets } = await s.storage.listBuckets()
  const exists = (buckets||[]).some(b=> b.name === PRODUCT_BUCKET)
  if(!exists){
    const { error } = await s.storage.createBucket(PRODUCT_BUCKET, { public: true })
    if(error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, bucket: PRODUCT_BUCKET })
}
