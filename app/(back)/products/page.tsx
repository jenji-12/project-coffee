import Card from '@/components/Card'
import Table from '@/components/Table'
import { listProducts } from './actions'
import Link from 'next/link'

export default async function Products({ searchParams }:{ searchParams: { shop?: string } }){
  const shop = searchParams?.shop
  if(!shop) return <Card>กรุณาเลือก Shop จาก / (auth)/select-shop</Card>
  const { data: items=[] } = await listProducts(shop) as any
  return <div className="space-y-4">
    <Card><div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">สินค้า</h1>
      <Link className="underline" href={`/(back)/products/new?shop=${shop}`}>+ เพิ่มสินค้า</Link>
    </div></Card>
    <Table>
      <thead><tr><th className="p-3 text-left">ชื่อ</th><th className="text-left">ราคา</th><th className="text-left">ภาพ</th></tr></thead>
      <tbody>{items.map((p:any)=>(
        <tr key={p.id} className="border-t border-white/10">
          <td className="p-3"><a className="underline" href={`/(back)/products/${p.id}?shop=${shop}`}>{p.name}</a></td>
          <td>{p.price}</td>
          <td>{p.image_path ? <img src={p.image_path} className="h-10 w-10 object-cover rounded" /> : '-'}</td>
        </tr>
      ))}</tbody>
    </Table>
  </div>
}
