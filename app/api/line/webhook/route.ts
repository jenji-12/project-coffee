import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { replyMessage } from '@/lib/line_message'
import { normalizeQty, tokens } from '@/lib/thai_nlu'

function sb(){ return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } }) }

async function getLineCred(shop_id: string){
  const s = sb()
  const { data } = await s.from('shop_settings').select('extra').eq('shop_id', shop_id).single()
  const ex = (data?.extra||{}) as any
  const token = ex.line_channel_token || process.env.LINE_CHANNEL_TOKEN
  const secret = ex.line_channel_secret || process.env.LINE_CHANNEL_SECRET
  return { token, secret }
}

function verifySignature(secret: string, body: string, signature: string){
  const h = crypto.createHmac('sha256', secret).update(body).digest('base64')
  return h === signature
}

async function findShopFromToId(toId: string){
  // Simplify: assume we store LINE toId in shop_settings.extra.line_to_id
  const s = sb()
  const { data } = await s.from('shop_settings').select('shop_id,extra').limit(1000)
  for(const row of data||[]){
    if((row.extra||{}).line_to_id === toId) return row.shop_id as string
  }
  // fallback: choose the first shop
  return (data||[])[0]?.shop_id || null
}

export async function POST(req: Request){
  const raw = await req.text()
  const sig = req.headers.get('x-line-signature')||''
  let parsed: any = null
  try{ parsed = JSON.parse(raw) }catch{ return NextResponse.json({ ok:false }, { status: 400 }) }

  const toId = parsed?.destination
  const shop = await findShopFromToId(toId)
  if(!shop) return NextResponse.json({ ok:false, error: 'no shop matched' }, { status: 400 })

  const { token, secret } = await getLineCred(shop)
  if(!token || !secret) return NextResponse.json({ ok:false, error:'LINE token/secret missing' }, { status: 500 })
  if(!verifySignature(secret, raw, sig)) return NextResponse.json({ ok:false, error:'bad signature' }, { status: 401 })

  for(const ev of parsed.events||[]){
    if(ev.type !== 'message' || ev.message?.type !== 'text') continue
    const replyToken = ev.replyToken
    const text = String(ev.message.text||'').trim()
    const s = sb()

    // load products for fuzzy match
    const { data: products=[] } = await s.from('products').select('id,name,price').eq('shop_id', shop).eq('is_active', true)
    const ts = tokens(text)

    // naive parse: for each product, if product name substring present -> add 1 qty (or Thai digit)
    const wanted: any[] = []
    for(const p of products){
      const name = String(p.name||'').toLowerCase()
      if(ts.some((w:string)=> name.includes(w) || w.includes(name))){
        const qty = normalizeQty(text) || 1
        wanted.push({ p, qty })
      }
    }
    if(wanted.length===0){
      await replyMessage(token, replyToken, [{ type:'text', text:'ขออภัย ไม่พบสินค้าในข้อความครับ กรุณาระบุชื่อเมนูและจำนวน เช่น "ลาเต้ 2 แก้ว"' }])
      continue
    }

    // open sale
    const { data: sale } = await s.from('sales').insert({ shop_id: shop, status:'open', subtotal:0, discount:0, tax:0, total:0 }).select('*').single()

    for(const w of wanted){
      await s.from('sale_items').insert({ sale_id: sale.id, product_id: w.p.id, product_name_legacy: w.p.name, qty: w.qty, unit_price: w.p.price, line_discount: 0 })
    }

    // recompute total quickly
    const { data: items=[] } = await s.from('sale_items').select('qty,unit_price,line_discount').eq('sale_id', sale.id)
    const total = (items||[]).reduce((a:any,c:any)=> a + c.qty*c.unit_price - (c.line_discount||0), 0)
    await s.from('sales').update({ subtotal: total, total }).eq('id', sale.id)

    const payUrl = `${process.env.NEXT_PUBLIC_BASE_URL||''}/(front)/pos/receipt?sale=${sale.id}`
    const summary = wanted.map(w=> `${w.p.name} × ${w.qty}`).join('\n')
    await replyMessage(token, replyToken, [{ type:'text', text: `สรุปออเดอร์:\n${summary}\nยอดรวม: ${total} บาท\nดูใบเสร็จ/ชำระ: ${payUrl}` }])
  }

  return NextResponse.json({ ok:true })
}
