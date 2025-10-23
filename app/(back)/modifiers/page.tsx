import Card from '@/components/Card'
import Table from '@/components/Table'
import { listGroups, upsertGroup, deleteGroup, listModifiers, upsertModifier, deleteModifier, linkProductToGroup, unlinkProductFromGroup } from './actions'
import { sb } from '@/lib/supabaseServer'

export default async function Modifiers({ searchParams }:{ searchParams:{ shop?:string, product?:string } }){
  const shop = searchParams?.shop!
  const product = searchParams?.product || null
  const groups = await listGroups(shop)
  const s = sb()
  const { data: products=[] } = await s.from('products').select('id,name').eq('shop_id', shop).order('name')

  async function createGroup(formData:FormData){ 'use server'
    await upsertGroup(shop, { name: formData.get('name'), min_select: Number(formData.get('min')||0), max_select: Number(formData.get('max')||1), required: Boolean(formData.get('required')) })
  }

  return <div className="space-y-4">
    <Card><h1 className="text-2xl font-bold">Modifiers</h1></Card>

    <Card>
      <h2 className="font-bold mb-2">สร้างกลุ่ม</h2>
      <form action={createGroup} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
        <div><label>ชื่อ</label><input name="name" className="block p-2 rounded text-black"/></div>
        <div><label>Min</label><input name="min" type="number" defaultValue={0} className="block p-2 rounded text-black"/></div>
        <div><label>Max</label><input name="max" type="number" defaultValue={1} className="block p-2 rounded text-black"/></div>
        <div><label>Required</label><input name="required" type="checkbox" className="block"/></div>
        <button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">บันทึก</button>
      </form>
    </Card>

    <Card>
      <h2 className="font-bold mb-2">กลุ่มทั้งหมด</h2>
      <Table><thead><tr><th className="p-3 text-left">ชื่อ</th><th>Min</th><th>Max</th><th>Req</th><th></th></tr></thead>
      <tbody>
        {groups.map((g:any)=>(<tr key={g.id} className="border-t border-white/10">
          <td className="p-3">{g.name}</td><td>{g.min_select}</td><td>{g.max_select}</td><td>{String(g.required)}</td>
          <td>
            <form action={async()=>{ 'use server'; await deleteGroup(g.id) }}><button className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500">ลบ</button></form>
          </td>
        </tr>))}
      </tbody></Table>
    </Card>

    <Card>
      <h2 className="font-bold mb-2">ตัวเลือกในกลุ่ม (เลือกกลุ่มเพื่อแก้ไข)</h2>
      <div className="space-y-4">
        {groups.map((g:any)=>(<GroupEditor key={g.id} group={g} />))}
      </div>
    </Card>

    <Card>
      <h2 className="font-bold mb-2">ผูกกลุ่มกับสินค้า (เพื่อให้แสดงใน POS)</h2>
      <ProductLinker products={products} groups={groups} />
    </Card>
  </div>
}

async function GroupEditor({ group }:{ group:any }){
  const items = await listModifiers(group.id)
  async function add(formData:FormData){ 'use server'; await upsertModifier(group.id, { name: formData.get('name'), price_delta: Number(formData.get('price')||0), sort_order: Number(formData.get('sort')||0) }) }
  return <div>
    <h3 className="font-semibold">{group.name}</h3>
    <form action={add} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end my-2">
      <div><label>ชื่อ</label><input name="name" className="block p-2 rounded text-black"/></div>
      <div><label>เพิ่มราคา</label><input name="price" type="number" step="0.01" className="block p-2 rounded text-black"/></div>
      <div><label>ลำดับ</label><input name="sort" type="number" className="block p-2 rounded text-black"/></div>
      <button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">เพิ่ม</button>
    </form>
    <ul className="space-y-1">
      {items.map((m:any)=>(<li key={m.id} className="flex justify-between bg-white/5 p-2 rounded">
        <span>{m.name} (+{m.price_delta})</span>
        <form action={async()=>{ 'use server'; await deleteModifier(m.id) }}><button className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500">ลบ</button></form>
      </li>))}
    </ul>
  </div>
}

function ProductLinker({ products, groups }:{ products:any[], groups:any[] }){
  return <form action={async(formData:FormData)=>{ 'use server'
    const prod = String(formData.get('product')||'')
    const grp = String(formData.get('group')||'')
    if(prod && grp){ await linkProductToGroup(prod, grp) }
  }} className="flex flex-wrap gap-2 items-end">
    <div><label>สินค้า</label><select name="product" className="block p-2 rounded text-black">{products.map((p:any)=>(<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
    <div><label>กลุ่ม</label><select name="group" className="block p-2 rounded text-black">{groups.map((g:any)=>(<option key={g.id} value={g.id}>{g.name}</option>))}</select></div>
    <button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">ผูก</button>
  </form>
}
