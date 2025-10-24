'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function ImageDropCrop({ shop, productId, onCropped }:{ shop:string, productId:string, onCropped:(url:string)=>void }){
  const [img, setImg] = useState<HTMLImageElement|null>(null)
  const [preview, setPreview] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const inputRef = useRef<HTMLInputElement|null>(null)

  const onDrop = useCallback((e: React.DragEvent)=>{
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if(f) readFile(f)
  },[])

  function readFile(f: File){
    const fr = new FileReader()
    fr.onload = ()=>{
      const image = new Image()
      image.onload = ()=>{ setImg(image); drawSquare(image) }
      image.src = String(fr.result)
    }
    fr.readAsDataURL(f)
  }

  function drawSquare(image: HTMLImageElement){
    const c = canvasRef.current!
    const size = 512
    c.width = size; c.height = size
    const ctx = c.getContext('2d')!
    // center-crop square
    const s = Math.min(image.width, image.height)
    const sx = Math.floor((image.width - s)/2)
    const sy = Math.floor((image.height - s)/2)
    ctx.clearRect(0,0,size,size)
    ctx.drawImage(image, sx, sy, s, s, 0,0, size, size)
    const dataUrl = c.toDataURL('image/jpeg', 0.9)
    setPreview(dataUrl)
  }

  async function upload(){
    if(!preview) return
    const r = await fetch('/api/storage/upload-product-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop, productId, dataUrl: preview })
    })
    const data = await r.json()
    if(r.ok){ onCropped(data.publicUrl) } else { alert(data?.error || 'upload failed') }
  }

  return <div>
    <div className="p-3 rounded-xl bg-white/10 border border-white/10"
      onDragOver={e=> e.preventDefault()} onDrop={onDrop}>
      <p className="text-sm opacity-80">ลากรูปมาวางที่นี่ หรือ</p>
      <button type="button" className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 mt-2" onClick={()=> inputRef.current?.click()}>เลือกไฟล์</button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e=>{
        const f = e.target.files?.[0]; if(f) readFile(f)
      }}/>
      <div className="mt-3 grid md:grid-cols-2 gap-3 items-start">
        <div>
          <canvas ref={canvasRef} className="w-full rounded-lg bg-black/20 border border-white/10" />
        </div>
        <div>
          {preview ? <img src={preview} alt="preview" className="rounded-lg" /> : <div className="opacity-70 text-sm">พรีวิวจะแสดงที่นี่</div>}
          <div className="mt-2"><button type="button" onClick={upload} className="px-4 py-2 rounded bg-white/20 hover:bg-white/30">อัปโหลด</button></div>
        </div>
      </div>
    </div>
  </div>
}
