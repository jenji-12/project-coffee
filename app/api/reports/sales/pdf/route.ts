import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request){
  const url = new URL(req.url); const shop = url.searchParams.get('shop')!
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data } = await s.from('v_sales_by_day').select('*').eq('shop_id', shop).order('day_local')

  const doc = new PDFDocument({ margin: 40 })
  const chunks: any[] = []
  doc.fontSize(18).text('Sales by Day', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12)
  ;(data||[]).forEach((r:any)=>{
    doc.text(`${r.day_local} — orders: ${r.orders}, revenue: ${r.revenue}`, { continued:false })
  })
  doc.end()
  doc.on('data', (c)=> chunks.push(c))
  const buf: Buffer = await new Promise(res=> doc.on('end', ()=> res(Buffer.concat(chunks as any))))
  return new NextResponse(buf, { headers: { 'Content-Type': 'application/pdf','Content-Disposition':'attachment; filename="sales_by_day.pdf"' } })
}
