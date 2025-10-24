'use client'
import { useEffect, useState } from 'react'
export default function MemberSearch({ shop, onPick }:{ shop:string, onPick:(m:any)=>void }){
  const [q,setQ] = useState('')
  const [items,setItems] = useState<any[]>([])
  useEffect(()=>{
    const t = setTimeout(async()=>{
      if(!q){ setItems([]); return }
      const r = await fetch(`/api/pos/search-members?shop=${shop}&q=${encodeURIComponent(q)}`)
      const data = await r.json()
      setItems(data||[])
    }, 300)
    return ()=> clearTimeout(t)
  },[q,shop])
  return <div>
    <input placeholder="ชื่อ/เบอร์สมาชิก (Alt+F focus)" className="w-full p-2 rounded text-black" value={q} onChange={e=>setQ(e.target.value)} />
    {items.length>0 && <ul className="mt-2 bg-white/10 rounded-xl max-h-60 overflow-auto">
      {items.map(m=>(<li key={m.id}>
        <button className="w-full text-left px-3 py-2 hover:bg-white/20 rounded-xl" onClick={()=>onPick(m)}>
          {m.name} — {m.phone||'-'} (cups:{m.cups_bought})
        </button>
      </li>))}
    </ul>}
  </div>
}
