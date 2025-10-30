'use client'
import Card from '../../../components/Card'
import { useEffect, useMemo, useState } from 'react'

function tplPercent(){ return { type:'percent', percent:10, scope:'order', min_subtotal:0 } }
function tplAmount(){ return { type:'amount', amount:20, scope:'order', min_subtotal:0 } }
function tplBuyXGetY(){ return { type:'buyxgety', buy:{ product_id:'', qty:2 }, get:{ product_id:'', qty:1, discount:'free' } } }
function tplCombo(){ return { type:'combo', items:[{ product_id:'', qty:1 },{ product_id:'', qty:1 }], bundle_price:99 } }

export default function NewPage({ searchParams }:{ searchParams:{ shop?:string, id?:string } }){
  const shop = searchParams?.shop!
  const id = searchParams?.id
  const [form, setForm] = useState<any>({ name:'', priority:0, is_active:true, starts_at:'', ends_at:'', rule_json: tplPercent() })
  const [products,setProducts] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{ (async()=>{
    const r = await fetch(`/api/products/list?shop=${shop}`); setProducts(await r.json())
    if(id){ const p = await fetch(`/api/promotions/get?id=${id}`); setForm(await p.json()) }
    setLoading(false)
  })() },[shop,id])

  async function save(e:any){
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('rule_json', JSON.stringify(form.rule_json))
    const r = await fetch(`/api/promotions/upsert?shop=${shop}`, { method:'POST', body: fd })
    if(r.ok){ location.href=`/(back)/promotions?shop=${shop}` } else { alert('บันทึกไม่สำเร็จ') }
  }

  return <Card>
    <form onSubmit={save} className="space-y-2">
      <h1 className="text-2xl font-bold">{id?'แก้ไขโปรโมชัน':'สร้างโปรโมชัน'}</h1>
      <label>ชื่อ</label><input name="name" className="block p-2 rounded text-black" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <div className="grid grid-cols-2 gap-2">
        <div><label>Priority</label><input name="priority" type="number" className="block p-2 rounded text-black" value={form.priority} onChange={e=>setForm({...form,priority:Number(e.target.value||0)})}/></div>
        <div className="flex items-center gap-2"><input name="is_active" type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/><span>Active</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label>เริ่ม</label><input name="starts_at" type="datetime-local" className="block p-2 rounded text-black" value={form.starts_at||''} onChange={e=>setForm({...form,starts_at:e.target.value})}/></div>
        <div><label>สิ้นสุด</label><input name="ends_at" type="datetime-local" className="block p-2 rounded text-black" value={form.ends_at||''} onChange={e=>setForm({...form,ends_at:e.target.value})}/></div>
      </div>
      <div className="bg-white/10 p-3 rounded-xl">
        <div className="flex flex-wrap gap-2 mb-2">
          <button type="button" className="px-3 py-1 rounded bg-white/20" onClick={()=>setForm({...form, rule_json: tplPercent()})}>Percent %</button>
          <button type="button" className="px-3 py-1 rounded bg-white/20" onClick={()=>setForm({...form, rule_json: tplAmount()})}>Amount ฿</button>
          <button type="button" className="px-3 py-1 rounded bg-white/20" onClick={()=>setForm({...form, rule_json: tplBuyXGetY()})}>Buy X Get Y</button>
          <button type="button" className="px-3 py-1 rounded bg-white/20" onClick={()=>setForm({...form, rule_json: tplCombo()})}>Combo</button>
        </div>
        <pre className="text-xs bg-black/50 p-2 rounded">{JSON.stringify(form.rule_json, null, 2)}</pre>
        <p className="text-xs opacity-80">* เลือก product_id จากรายการสินค้า (เติม ID ลง JSON)</p>
      </div>
      {id && <input type="hidden" name="id" value={id}/>}
      <button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">บันทึก</button>
    </form>
  </Card>
}
