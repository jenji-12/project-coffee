import Card from '@/components/Card'
import { getProduct, upsertProduct, deleteProduct } from '../actions'
import ImageUploader from '@/components/Upload/ImageUploader'

export default async function EditProduct({ params, searchParams }:{ params:{ id:string }, searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const { data: row } = await getProduct(params.id) as any

  async function save(formData:FormData){ 'use server'
    const name = String(formData.get('name')||'').trim()
    const price = Number(formData.get('price')||0)
    const image_path = String(formData.get('image_path')||'') || null
    await upsertProduct(shop, { id: params.id, name, price, image_path })
  }
  async function remove(){ 'use server'; await deleteProduct(params.id) }

  return <Card>
    <form action={save} className="space-y-2">
      <h1 className="text-2xl font-bold mb-2">แก้ไขสินค้า</h1>
      <label>ชื่อ</label>
      <input name="name" className="block p-2 rounded text-black" required defaultValue={row?.name||''} />
      <label>ราคา</label>
      <input name="price" type="number" step="0.01" className="block p-2 rounded text-black" required defaultValue={row?.price||0} />
      <label>รูปภาพ (image_path)</label>
      <input name="image_path" className="block p-2 rounded text-black" defaultValue={row?.image_path||''} placeholder="จะถูกกรอกอัตโนมัติหลังอัปโหลด" />
      <div className="mt-2">
        <ImageUploader shop={shop} productId={params.id} onUploaded={(url)=>{
          const el = document.querySelector('input[name=image_path]') as HTMLInputElement
          if(el) el.value = url
        }} />
      </div>
      <div className="flex gap-2 mt-3">
        <button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">บันทึก</button>
        <form action={remove}><button className="px-4 py-2 rounded bg-red-500/80 hover:bg-red-500">ลบสินค้า</button></form>
      </div>
    </form>
  </Card>
}
