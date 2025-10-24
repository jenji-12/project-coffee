'use client'
import { useEffect, useState } from 'react'

type Modifier = { id:string, name:string, price_delta:number }
type Group = { id:string, name:string, min_select:number, max_select:number, required:boolean, modifiers: Modifier[] }

export default function ModifiersPicker({ productId, onConfirm, onCancel }:{ productId:string, onConfirm:(opts:any)=>void, onCancel:()=>void }){
  const [groups,setGroups] = useState<Group[]>([])
  const [chosen,setChosen] = useState<Record<string, string[]>>({})

  useEffect(()=>{
    (async()=>{
      const res = await fetch(`/api/pos/product-config?product=${productId}`)
      const data = await res.json()
      setGroups(data||[])
    })()
  },[productId])

  function toggle(groupId:string, modId:string, max:number){
    setChosen(prev=>{
      const arr = prev[groupId] || []
      if(arr.includes(modId)){
        return { ...prev, [groupId]: arr.filter(x=>x!==modId) }
      }else{
        if(arr.length >= max) return prev
        return { ...prev, [groupId]: [...arr, modId] }
      }
    })
  }

  return <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center p-4 z-50">
    <div className="bg-white text-black w-full max-w-2xl rounded-2xl p-4">
      <h3 className="text-xl font-bold mb-3">ตัวเลือกเพิ่มเติม</h3>
      <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
        {groups.map(g=>(
          <div key={g.id} className="border-b pb-3">
            <div className="font-medium">{g.name} {g.required?'*':''} <span className="text-xs opacity-70">(เลือก {g.min_select}-{g.max_select})</span></div>
            <div className="flex flex-wrap gap-2 mt-2">
              {g.modifiers?.map(m=>(
                <button key={m.id} onClick={()=>toggle(g.id, m.id, g.max_select)}
                  className={`px-3 py-1 rounded-full border ${chosen[g.id]?.includes(m.id)?'bg-black text-white':'bg-white text-black'}`}>
                  {m.name}{m.price_delta?` (+${m.price_delta})`:''}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button className="px-4 py-2 rounded bg-gray-200" onClick={onCancel}>ยกเลิก</button>
        <button className="px-4 py-2 rounded bg-black text-white" onClick={()=> onConfirm(chosen)}>ยืนยัน</button>
      </div>
    </div>
  </div>
}
