'use client'
import Card from '../../../components/Card'
import { useRef, useState } from 'react'

export default function ImportExport({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const [msg,setMsg] = useState<string>('')
  const pRef = useRef<HTMLInputElement>(null)
  const mRef = useRef<HTMLInputElement>(null)

  async function upload(kind:'products'|'members'){
    const ref = kind==='products'?pRef:mRef
    const f = ref.current?.files?.[0]
    if(!f){ setMsg('กรุณาเลือกไฟล์ก่อน'); return }
    const fd = new FormData(); fd.set('file', f)
    const r = await fetch(`/api/import-export/import/${kind}?shop=${shop}`, { method:'POST', body: fd })
    const data = await r.json(); setMsg(JSON.stringify(data))
  }

  return <div className="space-y-4">
    <Card><h1 className="text-2xl font-bold">Import/Export</h1></Card>
    <Card>
      <h2 className="font-semibold mb-2">Products</h2>
      <div className="flex flex-wrap gap-2 mb-2">
        <a className="underline" href="/api/import-export/templates/products.csv">ดาวน์โหลดเทมเพลต</a>
        <a className="underline" href={`/api/import-export/export/products.csv?shop=${shop}`}>Export CSV</a>
      </div>
      <input ref={pRef} type="file" accept=".csv" />
      <button className="px-3 py-1 rounded bg-white/20 ml-2" onClick={()=>upload('products')}>Import</button>
    </Card>

    <Card>
      <h2 className="font-semibold mb-2">Members</h2>
      <div className="flex flex-wrap gap-2 mb-2">
        <a className="underline" href="/api/import-export/templates/members.csv">ดาวน์โหลดเทมเพลต</a>
        <a className="underline" href={`/api/import-export/export/members.csv?shop=${shop}`}>Export CSV</a>
      </div>
      <input ref={mRef} type="file" accept=".csv" />
      <button className="px-3 py-1 rounded bg-white/20 ml-2" onClick={()=>upload('members')}>Import</button>
    </Card>

    {msg && <Card><pre className="text-xs">{msg}</pre></Card>}
  </div>
}
