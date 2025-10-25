import { createClient } from '@supabase/supabase-js'

async function getShopLineToken(shop_id: string){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE!
  const s = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await s.from('shop_settings').select('extra, shops:shop_id(name)').eq('shop_id', shop_id).single()
  const token = (data?.extra && (data.extra as any).line_token) || process.env.LINE_NOTIFY_TOKEN
  const shopName = data?.shops?.name || 'ร้านของคุณ'
  return { token, shopName }
}

export async function lineNotify(shop_id: string, message: string){
  const { token } = await getShopLineToken(shop_id)
  if(!token){ return { ok:false, error: 'No LINE token found for this shop.' } }
  const body = new URLSearchParams(); body.set('message', message)
  const r = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })
  if(!r.ok){
    try{ const j = await r.json(); return { ok:false, error: j?.message || r.statusText } }
    catch{ return { ok:false, error: r.statusText } }
  }
  return { ok:true }
}
