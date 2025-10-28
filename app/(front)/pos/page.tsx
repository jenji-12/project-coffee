'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CategoriesTabs from '../../../components/pos/CategoriesTabs'
import ProductGrid from '../../../components/pos/ProductGrid'
import MemberSearch from '@/components/pos/MemberSearch'
import PaymentPanel from '@/components/pos/PaymentPanel'
import HotkeysHelp from '@/components/pos/HotkeysHelp'
import Button from '@/components/Button'
import ModifiersPicker from '@/components/pos/ModifiersPicker'
import * as A from './actions'

type Totals = { subtotal:number, discount:number, tax:number, total:number }

export default function POS(){
  const shop = useMemo(()=> new URLSearchParams(typeof window!=='undefined'?location.search:'').get('shop')||'', [])
  const [sale,setSale] = useState<any>(null)
  const [items,setItems] = useState<any[]>([])
  const [tot,setTot] = useState<Totals>({subtotal:0,discount:0,tax:0,total:0})
  const [cats,setCats] = useState<any[]>([])
  const [activeCat,setActiveCat] = useState<string|null>(null)
  const [products,setProducts] = useState<any[]>([])
  const [member,setMember] = useState<any>(null)
  const [pickFor,setPickFor] = useState<any|null>(null) // product waiting modifiers
  const memberInputRef = useRef<HTMLInputElement|null>(null)

  // init sale + categories + products
  useEffect(()=>{ (async()=>{
    if(!shop) return
    const s = await A.openSale(shop, member?.id || null); setSale(s)
    const cs = await A.listCategories(shop); setCats(cs)
    const ps = await A.listProducts(shop, null); setProducts(ps)
  })() },[shop])

  // load products by category
  useEffect(()=>{ (async()=>{
    if(!shop) return
    const ps = await A.listProducts(shop, activeCat)
    setProducts(ps)
  })() },[activeCat, shop])

  // keyboard shortcuts
  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if(e.altKey){
        // Alt+1..9 add product by grid index
        if(e.key>='1' && e.key<='9'){
          const idx = Number(e.key)-1
          const p = products[idx]
          if(p){ e.preventDefault(); pickProduct(p) }
        }
        if(e.key.toLowerCase()==='c'){ e.preventDefault(); quickPay('cash') }
        if(e.key.toLowerCase()==='f'){ e.preventDefault(); (memberInputRef.current as any)?.focus?.() }
        if(e.key.toLowerCase()==='v'){ e.preventDefault(); voidBill() }
      }
      if((e.ctrlKey||e.metaKey) && e.key==='Enter'){ e.preventDefault(); quickPay('cash') }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[products, tot.total, sale])

  async function pickProduct(p:any){
    // If product has modifiers, show picker first
    const cfg = await A.getProductConfig(p.id)
    if(cfg && cfg.length>0){ setPickFor(p); return }
    await addProductWithOptions(p, null)
  }

  async function addProductWithOptions(p:any, options:any){
    if(!sale) return
    const it = await A.addItem(sale.id, { product_id: p.id, product_name: p.name, qty:1, unit_price: p.price, options_json: options })
    const rec = await A.recomputeTotals(sale.id)
    setItems(prev=>[...prev, it]); setTot(rec as any)
    setPickFor(null)
  }

  async function quickPay(method:'cash'|'card'|'ewallet'|'transfer'|'other'){
    if(!sale) return
    await A.pay(sale.id, method, tot.total)
    alert('ชำระเงินแล้ว ✅')
    location.reload()
  }

  async function voidBill(){
    if(!sale) return
    await A.voidSale(sale.id)
    alert('Void บิลแล้ว')
    location.reload()
  }

  return <div className="grid md:grid-cols-3 gap-4">
    <div className="md:col-span-2 space-y-4">
      <div className="bg-white/10 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">เมนู</h2>
          <HotkeysHelp/>
        </div>
        <CategoriesTabs items={cats} active={activeCat} onPick={setActiveCat} />
        <ProductGrid items={products} onPick={pickProduct} />
      </div>
      <div className="bg-white/10 p-4 rounded-2xl">
        <h2 className="text-xl font-bold mb-2">สมาชิก</h2>
        {/* @ts-ignore */}
        <MemberSearch shop={shop} onPick={(m)=> setMember(m)} />
        <input ref={memberInputRef as any} className="hidden" />
        {member && <p className="opacity-80 text-sm mt-2">เลือกสมาชิก: {member.name} — {member.phone||'-'}</p>}
      </div>
    </div>
    <div className="space-y-4">
      <div className="bg-white/10 p-4 rounded-2xl">
        <h2 className="text-xl font-bold mb-2">บิล</h2>
        <div className="space-y-2">
          {items.map((it:any)=>(
            <div key={it.id} className="flex justify-between gap-2 bg-white/5 p-2 rounded-xl">
              <div className="flex-1">
                <div className="font-medium">{it.product_name_legacy||'สินค้า'}</div>
                <div className="opacity-70 text-sm">{it.qty} × {it.unit_price}</div>
              </div>
              <div className="flex items-center gap-2">
                {/* Qty quick keys could be added later */}
                <button className="px-3 py-1 rounded bg-white/20 hover:bg-white/30" onClick={async()=>{
                  const newQty = (it.qty||1)+1; const updated = await A.updateItem(it.id, { qty: newQty }); const rec = await A.recomputeTotals(updated.sale_id); 
                  (it.qty=newQty); setItems([...items]); setTot(rec as any)
                }}>+1</button>
                <button className="px-3 py-1 rounded bg-white/20 hover:bg-white/30" onClick={async()=>{
                  const newQty = Math.max(1,(it.qty||1)-1); const updated = await A.updateItem(it.id, { qty: newQty }); const rec = await A.recomputeTotals(updated.sale_id); 
                  (it.qty=newQty); setItems([...items]); setTot(rec as any)
                }}>-1</button>
                <button className="px-3 py-1 rounded bg-white/20 hover:bg-white/30" onClick={async()=>{
                  await A.removeItem(it.id); if(!sale) return; const r = await A.getSale(sale.id); const rec = await A.recomputeTotals(sale.id); setItems(r.items); setTot(rec as any)
                }}>ลบ</button>
              </div>
            </div>
          ))}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between"><span>รวม</span><span>{tot.subtotal}</span></div>
            <div className="flex justify-between"><span>ส่วนลด</span><span>{tot.discount}</span></div>
            <div className="flex justify-between"><span>ภาษี</span><span>{tot.tax}</span></div>
            <div className="flex justify-between text-xl font-bold"><span>สุทธิ</span><span>{tot.total}</span></div>
          </div>
        </div>
      </div>
      <div className="bg-white/10 p-4 rounded-2xl">
        <PaymentPanel total={tot.total} onPay={quickPay} />
        <div className="mt-2"><Button onClick={voidBill}>Void Bill (Alt+V)</Button></div>
      </div>
    </div>

    {pickFor && <ModifiersPicker productId={pickFor.id} onCancel={()=>setPickFor(null)} onConfirm={(chosen)=>{
      // chosen is { [groupId]: string[] }
      const opt = { chosen }
      addProductWithOptions(pickFor, opt)
    }}/>}
  </div>
}
