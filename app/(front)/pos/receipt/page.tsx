import { createClient } from '@supabase/supabase-js'
import './receipt.css'

async function fetchData(sale_id:string){
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data: sale } = await s.from('sales').select('id,shop_id,order_no,subtotal,discount,tax,total,created_at, member:member_id(name,phone)').eq('id', sale_id).single()
  const { data: items=[] } = await s.from('sale_items').select('product_name_legacy,qty,unit_price,line_discount,line_total').eq('sale_id', sale_id).order('id')
  const { data: shop } = await s.from('shops').select('id,name').eq('id', sale.shop_id).single()
  const { data: setting } = await s.from('shop_settings').select('extra, shop_id').eq('shop_id', sale.shop_id).single()
  return { sale, items, shop, setting }
}

export default async function Receipt({ searchParams }:{ searchParams:{ sale?:string, w?:string } }){
  const sale_id = searchParams?.sale!
  const wide = searchParams?.w === '80'
  const { sale, items, shop, setting } = await fetchData(sale_id)
  const ex = (setting?.extra||{}) as any

  return <html><body>
    <div className={`receipt ${wide?'w80':''}`}>
      {ex.logo_url && <img src={ex.logo_url} className="logo" alt="logo"/>}
      <div className="center bold">{shop?.name||'ร้านของคุณ'}</div>
      {ex.address && <div className="center small">{ex.address}</div>}
      {(ex.phone||ex.tax_id) && <div className="center small">{[ex.phone, ex.tax_id?`TAX: ${ex.tax_id}`:''].filter(Boolean).join(' | ')}</div>}
      <div className="hr" />
      <div className="row small"><div>Order</div><div>#{sale?.order_no || sale?.id?.slice(0,8)}</div></div>
      <div className="row small"><div>Date</div><div>{new Date(sale.created_at).toLocaleString('th-TH')}</div></div>
      <div className="hr" />

      <div className="items">
        {items.map((it:any, idx:number)=>(
          <div key={idx} className="line">
            <div className="name">{it.product_name_legacy||'-'}</div>
            <div className="qty">{it.qty}</div>
            <div className="price">{(it.qty*it.unit_price - (it.line_discount||0)).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="hr" />
      <div className="total">
        <div className="row"><div>Subtotal</div><div>{Number(sale.subtotal).toFixed(2)}</div></div>
        <div className="row"><div>Discount</div><div>{Number(sale.discount).toFixed(2)}</div></div>
        <div className="row"><div>Tax</div><div>{Number(sale.tax).toFixed(2)}</div></div>
        <div className="row bold"><div>Total</div><div>{Number(sale.total).toFixed(2)}</div></div>
      </div>

      <div className="hr" />
      <div className="footer small">{ex.receipt_footer || 'ขอบคุณที่อุดหนุน'}</div>

      <div className="no-print center" style={{marginTop:10}}>
        <a href={`/api/receipts/pdf?sale=${sale_id}`} className="underline">ดาวน์โหลด PDF</a> ·{' '}
        <a href={`/api/receipts/escpos?sale=${sale_id}`} className="underline">ดาวน์โหลด ESC/POS</a> ·{' '}
        <button onClick={()=>window.print()} className="underline">พิมพ์</button>
      </div>
    </div>
  </body></html>
}
