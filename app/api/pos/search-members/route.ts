import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function sb(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: Request){
  const url = new URL(req.url)
  const shop = url.searchParams.get('shop')!
  const q = url.searchParams.get('q') || ''
  const like = `%${q}%`
  const s = sb()
  const { data } = await s.from('members').select('id,name,phone,cups_bought,points').eq('shop_id', shop).or(`name.ilike.${like},phone.ilike.${like}`).limit(20)
  return NextResponse.json(data||[])
}
