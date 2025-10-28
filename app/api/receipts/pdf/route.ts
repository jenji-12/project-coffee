// app/api/receipts/pdf/route.ts
export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { createClient } from '@supabase/supabase-js'

function streamToBuffer(doc: PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sale = url.searchParams.get('sale')
  if (!sale) {
    return NextResponse.json({ error: 'missing sale id' }, { status: 400 })
  }

  // ✅ ใช้ service role ที่ฝั่ง server เท่านั้น (อย่าใช้ NEXT_PUBLIC สำหรับ key นี้)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE!

  const s = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // --- โหลดข้อมูลใบเสร็จ
  const { data: head, error: e1 } = await s
    .from('sales')
    .select('id,shop_id,order_no,subtotal,discount,tax,total,created_at')
    .eq('id', sale)
    .single()
  if (e1 || !head) return NextResponse.json({ error: e1?.message ?? 'sale not found' }, { status: 404 })

  const { data: items, error: e2 } = await s
    .from('sale_items')
    .select('product_name_legacy,qty,unit_price,line_discount,line_total')
    .eq('sale_id', head.id)
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  const { data: shop, error: e3 } = await s
    .from('shops')
    .select('name,id')
    .eq('id', head.shop_id)
    .single()
  if (e3 || !shop) return NextResponse.json({ error: e3?.message ?? 'shop not found' }, { status: 404 })

  // --- สร้าง PDF
  const doc = new PDFDocument({ margin: 30, size: 'A6' })

  doc.fontSize(14).text(shop.name ?? 'ร้านของคุณ', { align: 'center' }).moveDown(0.5)
  doc.fontSize(10)
    .text(`Order: ${head.order_no ?? head.id}`, { align: 'center' })
    .text(new Date(head.created_at).toLocaleString('th-TH'), { align: 'center' })
    .moveDown(0.5)

  doc.moveTo(30, doc.y).lineTo(270, doc.y).stroke().moveDown(0.5)

  items?.forEach((it) => {
    const name = it.product_name_legacy ?? ''
    const qty = Number(it.qty).toFixed(0)
    const price = Number(it.unit_price).toFixed(2)
    const total = Number(it.line_total).toFixed(2)
    doc.text(`${name}  x${qty}  ${price}  =  ${total}`)
  })

  doc.moveDown(0.5).moveTo(30, doc.y).lineTo(270, doc.y).stroke().moveDown(0.5)
  doc.text(`Subtotal: ${Number(head.subtotal).toFixed(2)}`)
  doc.text(`Discount: ${Number(head.discount).toFixed(2)}`)
  doc.text(`Tax: ${Number(head.tax).toFixed(2)}`)
  doc.fontSize(12).text(`Total: ${Number(head.total).toFixed(2)}`, { align: 'right' })

  // ✅ แปลงสตรีมเป็น Buffer แล้วค่อยส่งคืน
  const pdfBuffer = await streamToBuffer(doc)

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="receipt-${head.id}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
