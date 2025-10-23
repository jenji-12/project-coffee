import Card from '@/components/Card'
import { sb } from '@/lib/supabaseServer'
import { receive } from '../actions'

export default async function Receive({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const s = sb()
  const { data: products=[] } = await s.from('products').select('id,name').eq('shop_id', shop).order('name')

  async function doReceive(formData:FormData){ 'use server'
    const product_id = String(formData.get('product_id'))
    const qty = Number(formData.get('qty')||0)
    const note = String(formData.get('note')||'')
    await receive(shop, product_id, qty, note)
  }

  return <Card>
    <form action={doReceive} className="space-y-2">
      <h1 className="text-2xl font-bold mb-2">รับเข้าสต๊อก</h1>
      <label>สินค้า</label>
      <select name="product_id" className="block p-2 rounded text-black">
        {products.map((p:any)=>(<option key={p.id} value={p.id}>{p.name}</option>))}
      </select>
      <label>จำนวน</label>
      <input name="qty" type="number" step="0.01" className="block p-2 rounded text-black" required />
      <label>หมายเหตุ</label>
      <input name="note" className="block p-2 rounded text-black" placeholder="เช่น รับเข้าจากซัพพลายเออร์ A"/>
      <button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30 mt-2">บันทึก</button>
    </form>
  </Card>
}
