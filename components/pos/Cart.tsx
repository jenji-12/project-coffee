'use client'
import Button from '@/components/Button'
export default function Cart({ items, totals, onQty, onRemove }:{ items:any[], totals:{subtotal:number,discount:number,tax:number,total:number}, onQty:(id:string,qty:number)=>void, onRemove:(id:string)=>void }){
  return <div className="space-y-2">
    {items.map((it:any)=>(
      <div key={it.id} className="flex items-center justify-between gap-2 bg-white/5 p-2 rounded-xl">
        <div className="flex-1">
          <div className="font-medium">{it.product_name_legacy||'สินค้า'}</div>
          <div className="opacity-70 text-sm">{it.qty} × {it.unit_price}</div>
        </div>
        <div className="flex items-center gap-2">
          <input type="number" min={1} className="w-16 p-1 rounded text-black" value={it.qty}
            onChange={e=>onQty(it.id, Number(e.target.value||1))}/>
          <Button onClick={()=>onRemove(it.id)}>ลบ</Button>
        </div>
      </div>
    ))}
    <div className="mt-4 space-y-1">
      <div className="flex justify-between"><span>รวม</span><span>{totals.subtotal}</span></div>
      <div className="flex justify-between"><span>ส่วนลด</span><span>{totals.discount}</span></div>
      <div className="flex justify-between"><span>ภาษี</span><span>{totals.tax}</span></div>
      <div className="flex justify-between text-xl font-bold"><span>สุทธิ</span><span>{totals.total}</span></div>
    </div>
  </div>
}
