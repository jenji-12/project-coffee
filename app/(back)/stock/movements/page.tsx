import Card from '@/components/Card'
import Table from '@/components/Table'
import { listMovements } from '../actions'

export default async function Movements({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const items = await listMovements(shop, 200)
  return <div className="space-y-4">
    <Card><h1 className="text-2xl font-bold">ประวัติการเคลื่อนไหว</h1></Card>
    <Table>
      <thead><tr><th className="p-3 text-left">เวลา</th><th className="text-left">สินค้า</th><th className="text-left">เหตุผล</th><th className="text-right">เปลี่ยนแปลง</th></tr></thead>
      <tbody>
        {items.map((m:any)=>(<tr key={m.created_at+m.product_id} className="border-t border-white/10">
          <td className="p-3">{new Date(m.created_at).toLocaleString('th-TH')}</td>
          <td>{m.products?.name||'-'}</td>
          <td>{m.reason}{m.ref_sale_id?` #${m.ref_sale_id.slice(0,8)}`:''}</td>
          <td className="text-right">{m.qty_change>0?`+${m.qty_change}`:m.qty_change}</td>
        </tr>))}
      </tbody>
    </Table>
  </div>
}
