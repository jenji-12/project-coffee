'use client'
export default function CategoriesTabs({ items, active, onPick }:{ items:{id:string,name:string}[], active:string|null, onPick:(id:string|null)=>void }){
  return <div className="flex gap-2 overflow-x-auto pb-1">
    <button className={`px-3 py-1 rounded-lg ${active===null?'bg-white/30':'bg-white/10 hover:bg-white/20'}`} onClick={()=>onPick(null)}>ทั้งหมด</button>
    {items.map(c=>(
      <button key={c.id} className={`px-3 py-1 rounded-lg ${active===c.id?'bg-white/30':'bg-white/10 hover:bg-white/20'}`} onClick={()=>onPick(c.id)}>{c.name}</button>
    ))}
  </div>
}
