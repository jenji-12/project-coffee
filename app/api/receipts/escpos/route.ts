import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { EscPosEncoder } from '@/lib/escpos/encoder'

export async function GET(req: Request){
  const url = new URL(req.url); const sale = url.searchParams.get('sale')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data: head } = await s.from('sales').select('id,shop_id,order_no,subtotal,discount,tax,total,created_at').eq('id', sale).single()
  const { data: items=[] } = await s.from('sale_items').select('product_name_legacy,qty,unit_price,line_discount,line_total').eq('sale_id', sale).order('id')
  const { data: shop } = await s.from('shops').select('name').eq('id', head.shop_id).single()

  const enc = new EscPosEncoder().init().align('center').bold(true)
  enc.text(shop?.name || 'ร้านของคุณ').bold(false)
  enc.text(`Order: ${head.order_no || head.id}`)
  enc.text(new Date(head.created_at).toLocaleString('th-TH'))
  enc.feed()
  enc.align('left')
  items.forEach((it:any)=>{
    const name = (it.product_name_legacy||'-')
    const qty = `x${it.qty}`
    const price = (it.qty*it.unit_price - (it.line_discount||0)).toFixed(2)
    enc.text(`${name}`)
    enc.text(`${qty}    ${price}`)
  })
  enc.feed()
  enc.align('right')
  enc.text(`Subtotal: ${Number(head.subtotal).toFixed(2)}`)
  enc.text(`Discount: ${Number(head.discount).toFixed(2)}`)
  enc.text(`Tax: ${Number(head.tax).toFixed(2)}`)
  enc.bold(true).text(`Total: ${Number(head.total).toFixed(2)}`).bold(false)
  enc.feed(2).align('center').text('ขอบคุณที่อุดหนุน').feed().cut()

  const bytes = enc.bytes()
  return new NextResponse(bytes, { headers: { 'Content-Type':'application/octet-stream', 'Content-Disposition':'attachment; filename="receipt.bin"' } })
}
