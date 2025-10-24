'use client'
import Button from '@/components/Button'
export default function PaymentPanel({ total, onPay }:{ total:number, onPay:(m:'cash'|'card'|'ewallet'|'transfer'|'other')=>void }){
  const methods: ('cash'|'card'|'ewallet'|'transfer'|'other')[] = ['cash','card','ewallet','transfer','other']
  return <div className="space-y-2">
    <div className="text-xl font-bold">ชำระ {total}</div>
    <div className="grid grid-cols-2 gap-2">
      {methods.map(m=>(<Button key={m} onClick={()=>onPay(m)}>{m.toUpperCase()}</Button>))}
    </div>
    <p className="text-xs opacity-80">คีย์ลัด: Alt+C (เงินสด)</p>
  </div>
}
