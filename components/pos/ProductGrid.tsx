'use client'
type Product = { id: string, name: string, price: number, image_path?: string|null }
export default function ProductGrid({ items, onPick }:{ items: Product[], onPick:(p:Product)=>void }){
  return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
    {items.map((p,idx)=>(
      <button key={p.id} className="bg-white/10 rounded-xl p-3 text-left hover:bg-white/20"
        onClick={()=>onPick(p)}
        data-kb={(idx<9)?(idx+1):''} title={(idx<9)?`Alt+${idx+1}`:''}>
        <div className="aspect-square bg-white/5 rounded-lg mb-2 overflow-hidden">
          {p.image_path ? <img src={p.image_path} alt={p.name} className="w-full h-full object-cover"/> : <div className="w-full h-full" />}
        </div>
        <div className="font-medium line-clamp-1">{p.name}</div>
        <div className="opacity-80 text-sm">{p.price}</div>
      </button>
    ))}
  </div>
}
