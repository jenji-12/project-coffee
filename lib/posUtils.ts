export type Money = number
export const toNumber = (v:any, d=0)=>{
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}
export const round2 = (x:number)=> Math.round((x + Number.EPSILON) * 100) / 100
