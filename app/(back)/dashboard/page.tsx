import Card from '@/components/Card'

async function fetchSales(shop:string){
  const url = `${process.env.NEXT_PUBLIC_BASE_URL||''}/api/metrics/sales-by-day?shop=${shop}`
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  return data
}

async function fetchTopProducts(shop:string){
  const url = `${process.env.NEXT_PUBLIC_BASE_URL||''}/api/metrics/top-products?shop=${shop}`
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  return data
}

export default async function Dashboard({ searchParams }:{ searchParams:{ shop?:string } }){
  const shop = searchParams?.shop!
  const [sales, top] = await Promise.all([fetchSales(shop), fetchTopProducts(shop)])

  return <div className="grid md:grid-cols-2 gap-4">
    <Card>
      <h1 className="text-2xl font-bold mb-2">ยอดขายรายวัน</h1>
      {/* @ts-ignore */}
      <LineChart labels={sales.labels} series={sales.series} />
    </Card>
    <Card>
      <h1 className="text-2xl font-bold mb-2">สินค้า Top 10</h1>
      <ul className="space-y-1">{top.map((r:any)=>(<li key={r.name} className="flex justify-between"><span>{r.name}</span><span>{r.qty}</span></li>))}</ul>
    </Card>

    <Card className="md:col-span-2">
      <h2 className="text-xl font-bold mb-2">Reports</h2>
      <div className="flex flex-wrap gap-3">
        <a className="underline" href={`/api/reports/sales/csv?shop=${shop}`}>Sales by Day (CSV)</a>
        <a className="underline" href={`/api/reports/sales/pdf?shop=${shop}`}>Sales by Day (PDF)</a>
        <a className="underline" href={`/api/reports/product-mix/csv?shop=${shop}`}>Product Mix (CSV)</a>
        <a className="underline" href={`/api/reports/members/csv?shop=${shop}`}>Members (CSV)</a>
      </div>
    </Card>
  </div>
}

import dynamic from 'next/dynamic'
const LineChart = dynamic(()=> import('@/components/Chart/LineChart'), { ssr:false })
