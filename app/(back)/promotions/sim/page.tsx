'use client'
import Card from '@/components/Card'
import { useEffect, useState } from 'react'

export default function Sim({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const [products,setProducts] = useState<any[]>([])
  const [promos,setPromos] = useState<any[]>([])
  const [items,setItems] = useState<any[]>([])
  const [out,setOut] = useState<any>(null)

  useEffect(()=>{ (async()=>{
    setProducts(await (await fetch(`/api/products/list?shop=${shop}`)).json())
    setPromos(await (await fetch(`/api/promotions/list?shop=${shop}`)).json())
  })() },[shop])

  function add(p:any){ setItems(arr=> [...arr, { product_id: p.id, name:p.name, qty:1, unit_price:p.price, line_discount:0, line_total:p.price }]) }

  async function simulate(){
    const r = await fetch(`/api/promotions/simulate?shop=${shop}`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ items })
    })
    const data = await r.json(); setOut(data)
  }

  return <Card>
    <h1 className="text-2xl font-bold mb-2">Promotions Simulator</h1>
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h2 className="font-semibold">สินค้า</h2>
        <div className="flex flex-wrap gap-2">{products.map(p=>(<button key={p.id} className="px-3 py-1 rounded bg-white/20" onClick={()=>add(p)}>{p.name}</button>))}</div>
      </div>
      <div>
        <h2 className="font-semibold">บิลจำลอง</h2>
        <ul className="space-y-1">{items.map((it,idx)=>(<li key={idx} className="bg-white/10 p-2 rounded">{it.name} × {it.qty} — {it.unit_price}</li>))}</ul>
      </div>
    </div>
    <div className="mt-3 flex gap-2">
      <button className="px-4 py-2 rounded bg-white/20" onClick={simulate}>คำนวณโปร</button>
      <a className="underline" href={`/(back)/promotions?shop=${shop}`}>กลับหน้าโปรโมชัน</a>
    </div>
    {out && <pre className="text-xs bg-black/50 p-2 rounded mt-3">{JSON.stringify(out, null, 2)}</pre>}
  </Card>
}
