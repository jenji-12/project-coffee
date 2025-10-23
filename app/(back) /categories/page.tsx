import Card from '@/components/Card'
import Table from '@/components/Table'
import { listCategories, upsertCategory, deleteCategory } from './actions'

export default async function Categories({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const { data: items=[] } = await listCategories(shop) as any
  async function create(formData:FormData){ 'use server'; await upsertCategory(shop, { name: formData.get('name'), sort_order: Number(formData.get('sort_order')||0) }) }
  return <div className="space-y-4">
    <Card><h1 className="text-2xl font-bold">หมวดหมู่สินค้า</h1></Card>
    <Card><form action={create} className="flex gap-2"><input name="name" placeholder="ชื่อหมวดหมู่" className="p-2 rounded text-black"/><input name="sort_order" type="number" className="p-2 rounded text-black w-28" placeholder="ลำดับ"/><button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">เพิ่ม</button></form></Card>
    <Table><thead><tr><th className="p-3 text-left">ชื่อ</th><th className="text-left">ลำดับ</th><th></th></tr></thead>
    <tbody>{items.map((c:any)=>(<tr key={c.id} className="border-t border-white/10"><td className="p-3">{c.name}</td><td>{c.sort_order}</td><td>
      <form action={async()=>{ 'use server'; await deleteCategory(c.id) }}><button className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500">ลบ</button></form>
    </td></tr>))}</tbody></Table>
  </div>
}
