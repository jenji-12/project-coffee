import Card from '@/components/Card'
import { upsertProduct } from '../actions'
import ImageUploader from '@/components/Upload/ImageUploader'

export default function NewProduct({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  async function save(formData:FormData){ 'use server'
    const name = String(formData.get('name')||'').trim()
    const price = Number(formData.get('price')||0)
    const image_path = String(formData.get('image_path')||'') || null
    await upsertProduct(shop, { name, price, image_path, is_active: true })
  }
  return <Card>
    <form action={save} className="space-y-2">
      <h1 className="text-2xl font-bold mb-2">เพิ่มสินค้า</h1>
      <label>ชื่อ</label>
      <input name="name" className="block p-2 rounded text-black" required />
      <label>ราคา</label>
      <input name="price" type="number" step="0.01" className="block p-2 rounded text-black" required />
      <label>รูปภาพ (image_path)</label>
      <input name="image_path" className="block p-2 rounded text-black" placeholder="จะถูกกรอกอัตโนมัติหลังอัปโหลด" />
      <div className="mt-2">
        <ImageUploader shop={shop} productId="new" onUploaded={(url)=>{
          const el = document.querySelector('input[name=image_path]') as HTMLInputElement
          if(el) el.value = url
        }} />
      </div>
      <button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">บันทึก</button>
    </form>
  </Card>
}
