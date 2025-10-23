import Card from '@/components/Card'
import Table from '@/components/Table'
import { sb } from '@/lib/supabaseServer'
import { listStock } from './actions'

export default async function StockHome({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const items = await listStock(shop)
  const s = sb()
  const { data: products=[] } = await s.from('products').select('id,name').eq('shop_id', shop).order('name')

  return <div className="space-y-4">
    <Card>
      <h1 className="text-2xl font-bold mb-2">สต๊อก</h1>
      <div className="flex flex-wrap gap-3">
        <a className="underline" href={`/(back)/stock/receive?shop=${shop}`}>รับเข้า</a>
        <a className="underline" href={`/(back)/stock/issue?shop=${shop}`}>เบิก/ปรับออก</a>
        <a className="underline" href={`/(back)/stock/movements?shop=${shop}`}>ประวัติการเคลื่อนไหว</a>
        <a className="underline" href={`/api/reports/stock-low/csv?shop=${shop}`}>ดาวน์โหลดรายงานสต๊อกต่ำ (CSV)</a>
      </div>
    </Card>

    <Table>
      <thead><tr><th className="p-3 text-left">สินค้า</th><th>คงเหลือ</th><th>Reorder</th><th></th></tr></thead>
      <tbody>
        {items.map((r:any)=>(<tr key={r.product_id} className="border-t border-white/10">
          <td className="p-3">{r.products?.name||'-'}</td>
          <td className={Number(r.quantity_on_hand)<=Number(r.reorder_point||0)?'text-red-400':''}>{r.quantity_on_hand||0}</td>
          <td>{r.reorder_point||0}</td>
          <td><a className="underline" href={`/(back)/products/${r.product_id}?shop=${shop}`}>จัดการสินค้า</a></td>
        </tr>))}
      </tbody>
    </Table>
  </div>
}
