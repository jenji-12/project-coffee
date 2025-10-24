'use client'
import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function LineChart({ labels, series }:{ labels:string[], series:number[] }){
  const ref = useRef<HTMLCanvasElement|null>(null)
  useEffect(()=>{
    if(!ref.current) return
    const ctx = ref.current.getContext('2d')!
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{ label:'Revenue', data: series }]
      },
      options: { responsive:true, maintainAspectRatio:false }
    })
    return ()=> chart.destroy()
  }, [labels.join('|'), series.join('|')])
  return <div className="h-64"><canvas ref={ref}/></div>
}
