import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function GET(req: Request){
  const url = new URL(req.url); const id = url.searchParams.get('id')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data } = await s.from('promotions').select('*').eq('id', id).single()
  return NextResponse.json(data||{})
}
