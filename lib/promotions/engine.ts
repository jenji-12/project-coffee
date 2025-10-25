import { Promotion, PromotionRule, SaleItemLike, ApplyResult } from './types'

function inWindow(p: Promotion, now: Date){
  const s = p.starts_at ? new Date(p.starts_at) : null
  const e = p.ends_at ? new Date(p.ends_at) : null
  if(s && now < s) return false
  if(e && now > e) return false
  return p.is_active
}

function cloneItems(items: SaleItemLike[]): SaleItemLike[]{
  return items.map(i=> ({ ...i }))
}

export function applyPromotions(promos: Promotion[], items: SaleItemLike[]): ApplyResult{
  const now = new Date()
  const active = promos.filter(p=> inWindow(p, now)).sort((a,b)=> (a.priority||0)-(b.priority||0))
  let working = cloneItems(items)
  let orderDiscount = 0

  for(const p of active){
    const rule = p.rule_json as PromotionRule
    if(rule.type === 'percent'){
      const affectedIdx = pickScope(rule, working)
      if(affectedIdx.length===0) continue
      if(rule.min_subtotal && sumSubtotal(working, affectedIdx) < rule.min_subtotal) continue
      if(rule.scope === 'order'){
        const sub = sumSubtotal(working, undefined)
        orderDiscount += sub * (rule.percent/100)
      } else {
        for(const idx of affectedIdx){
          const it = working[idx]
          const base = it.qty * it.unit_price - (it.line_discount||0)
          it.line_discount += base * (rule.percent/100)
          it.line_total = base - it.line_discount
        }
      }
    }
    if(rule.type === 'amount'){
      const affectedIdx = pickScope(rule, working)
      if(affectedIdx.length===0) continue
      if(rule.scope === 'order'){
        orderDiscount += rule.amount
      } else {
        const split = rule.amount / affectedIdx.length
        for(const idx of affectedIdx){
          const it = working[idx]
          it.line_discount += split
          const base = it.qty * it.unit_price
          it.line_total = base - it.line_discount
        }
      }
    }
    if(rule.type === 'buyxgety'){
      const buyQty = totalQty(working, rule.buy.product_id)
      const times = Math.floor(buyQty / rule.buy.qty)
      if(times<=0) continue
      // discount applies to get.product_id items up to qty * times
      let remain = rule.get.qty * times
      for(const it of working){
        if(remain<=0) break
        if(it.product_id !== rule.get.product_id) continue
        const take = Math.min(remain, it.qty)
        const unit = it.unit_price
        let disc = 0
        if(rule.get.discount==='free'){
          disc = unit * take
        }else if(rule.get.discount==='percent'){
          disc = unit * take * ((rule.get.value||0)/100)
        }else if(rule.get.discount==='amount'){
          disc = (rule.get.value||0) * take
        }
        it.line_discount += disc
        it.line_total = it.qty * it.unit_price - it.line_discount
        remain -= take
      }
    }
    if(rule.type === 'combo'){
      // find how many full combos present
      const counts = rule.items.map(k=> Math.floor(totalQty(working, k.product_id)/k.qty))
      const times = Math.min(...counts)
      if(times<=0) continue
      // Compute current price for these quantities, then reduce to bundle_price * times
      let current = 0
      for(const k of rule.items){
        let needed = k.qty * times
        for(const it of working){
          if(needed<=0) break
          if(it.product_id!==k.product_id) continue
          const take = Math.min(needed, it.qty)
          current += take * it.unit_price
          needed -= take
        }
      }
      const target = rule.bundle_price * times
      const reduce = Math.max(0, current - target)
      // distribute reduce across involved items proportionally by their subtotal
      let subtotals: { idx:number, sub:number }[] = []
      for(let i=0;i<working.length;i++){
        const it = working[i]
        if(rule.items.some(k=>k.product_id===it.product_id)){
          subtotals.push({ idx:i, sub: it.qty*it.unit_price })
        }
      }
      const totalSub = subtotals.reduce((a,b)=>a+b.sub,0)
      if(totalSub>0){
        for(const s of subtotals){
          const it = working[s.idx]
          const part = reduce * (s.sub/totalSub)
          it.line_discount += part
          it.line_total = it.qty * it.unit_price - it.line_discount
        }
      }else{
        orderDiscount += reduce
      }
    }
  }

  // finalize non-negative totals
  for(const it of working){
    const base = it.qty*it.unit_price
    it.line_total = Math.max(0, base - (it.line_discount||0))
  }

  return { updatedItems: working, orderDiscount }
}

function sumSubtotal(items: SaleItemLike[], idxs?: number[]){
  if(!idxs) return items.reduce((a,c)=> a + c.qty*c.unit_price - (c.line_discount||0), 0)
  return idxs.reduce((a,i)=> a + items[i].qty*items[i].unit_price - (items[i].line_discount||0), 0)
}

function totalQty(items: SaleItemLike[], product_id: string){
  return items.filter(i=>i.product_id===product_id).reduce((a,c)=> a + c.qty, 0)
}

function pickScope(rule: any, items: SaleItemLike[]){
  if(rule.scope==='order') return items.map((_,i)=>i)
  if(rule.scope==='product'){
    const set = new Set(rule.product_ids||[])
    return items.map((it,i)=> set.has(it.product_id||'') ? i : -1).filter(i=> i>=0)
  }
  if(rule.scope==='category'){
    const set = new Set(rule.category_ids||[])
    return items.map((it,i)=> set.has(it.category_id||'') ? i : -1).filter(i=> i>=0)
  }
  return []
}
