import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request){
  const url = new URL(req.url); const sale = url.searchParams.get('sale')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data: head } = await s.from('sales').select('id,shop_id,order_no,subtotal,discount,tax,total,created_at').eq('id', sale).single()
  const { data: items=[] } = await s.from('sale_items').select('product_name_legacy,qty,unit_price,line_discount,line_total').eq('sale_id', sale).order('id')
  const { data: shop } = await s.from('shops').select('name').eq('id', head.shop_id).single()

  const doc = new PDFDocument({ margin: 30, size: 'A6' })
  const chunks: any[] = []
  doc.fontSize(14).text(shop?.name || 'ร้านของคุณ', { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(10).text(`Order: ${head.order_no || head.id}`, { align: 'center' })
  doc.text(new Date(head.created_at).toLocaleString('th-TH'), { align: 'center' })
  doc.moveDown(0.5)
  doc.moveTo(30, doc.y).lineTo(270, doc.y).stroke()

  doc.moveDown(0.5)
  items.forEach((it:any)=>{
    const line = `${it.product_name_legacy||'-'}   x${it.qty}   ${(it.qty*it.unit_price - (it.line_discount||0)).toFixed(2)}`
    doc.text(line)
  })
  doc.moveDown(0.5)
  doc.moveTo(30, doc.y).lineTo(270, doc.y).stroke()
  doc.moveDown(0.3)

  function row(label:string, val:any, bold=false){
    if(bold) doc.font('Helvetica-Bold')
    doc.text(`${label}: ${val}`, { align: 'right' })
    if(bold) doc.font('Helvetica')
  }
  row('Subtotal', Number(head.subtotal).toFixed(2))
  row('Discount', Number(head.discount).toFixed(2))
  row('Tax', Number(head.tax).toFixed(2))
  row('Total', Number(head.total).toFixed(2), true)

  doc.end(); doc.on('data', c=>chunks.push(c))
  const buf: Buffer = await new Promise(res=> doc.on('end', ()=> res(Buffer.concat(chunks as any))))
  return new NextResponse(buf, { headers: { 'Content-Type':'application/pdf', 'Content-Disposition':'attachment; filename="receipt.pdf"' } })
}
