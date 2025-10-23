'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { fetchPromotions } from '@/lib/promotions/server'
import { applyPromotions } from '@/lib/promotions/engine'

function sb(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function listCategories(shop_id: string){
  const s = sb()
  const { data, error } = await s.from('categories').select('id,name,sort_order').eq('shop_id', shop_id).order('sort_order')
  if(error) throw error
  return data||[]
}

export async function listProducts(shop_id: string, category_id?: string|null){
  const s = sb()
  let q = s.from('products').select('id,name,price,image_path,is_active,category_id').eq('shop_id', shop_id).eq('is_active', true)
  if(category_id){ q = q.eq('category_id', category_id) }
  const { data, error } = await q.order('name')
  if(error) throw error
  return data || []
}

export async function getProductConfig(product_id: string){
  const s = sb()
  const { data: groups } = await s
    .from('modifier_groups')
    .select('id,name,min_select,max_select,required, modifiers:modifiers(id,name,price_delta,sort_order) , product_links:product_modifier_groups!inner(product_id)')
    .eq('product_links.product_id', product_id)
    .order('name')
  return groups || []
}

export async function searchMembers(shop_id: string, q: string){
  const s = sb()
  const like = `%${q}%`
  const { data, error } = await s.from('members').select('id,name,phone,cups_bought,points').eq('shop_id', shop_id).or(`name.ilike.${like},phone.ilike.${like}`).limit(20)
  if(error) throw error
  return data || []
}

export async function openSale(shop_id: string, member_id?: string | null){
  const s = sb()
  const { data, error } = await s.from('sales').insert({ shop_id, member_id: member_id ?? null, status: 'open', subtotal: 0, discount: 0, tax: 0, total: 0 }).select('*').single()
  if(error) throw error
  return data
}

export async function getSale(sale_id: string){
  const s = sb()
  const { data: sale } = await s.from('sales').select('*').eq('id', sale_id).single()
  const { data: items } = await s.from('sale_items').select('*').eq('sale_id', sale_id).order('id')
  return { sale, items: items || [] }
}

export async function addItem(sale_id: string, payload: { product_id?: string|null, product_name?: string|null, qty: number, unit_price: number, line_discount?: number|null, options_json?: any }){
  const s = sb()
  const { data, error } = await s.from('sale_items').insert({
    sale_id,
    product_id: payload.product_id ?? null,
    product_name_legacy: payload.product_name ?? null,
    qty: payload.qty,
    unit_price: payload.unit_price,
    line_discount: payload.line_discount ?? 0,
    options_json: payload.options_json ?? null
  }).select('*').single()
  if(error) throw error
  await recomputeTotals(sale_id)
  revalidatePath('/(front)/pos')
  return data
}

export async function updateItem(item_id: string, patch: { qty?: number, unit_price?: number, line_discount?: number }){
  const s = sb()
  const { data, error } = await s.from('sale_items').update(patch).eq('id', item_id).select('*').single()
  if(error) throw error
  await recomputeTotals(data.sale_id)
  revalidatePath('/(front)/pos')
  return data
}

export async function removeItem(item_id: string){
  const s = sb()
  const { data: row } = await s.from('sale_items').select('sale_id').eq('id', item_id).single()
  const { error } = await s.from('sale_items').delete().eq('id', item_id)
  if(error) throw error
  if(row?.sale_id){ await recomputeTotals(row.sale_id) }
  revalidatePath('/(front)/pos')
  return true
}

export async function recomputeTotals(sale_id: string){
  const s = sb()
  // Load items with category for rules
  const { data: items=[] } = await s.from('sale_items').select('id,sale_id,product_id,product_name_legacy,qty,unit_price,line_discount,line_total,products:product_id(category_id)').eq('sale_id', sale_id)
  // Reset line_discount to base (engine calculates discounts fresh)
  const reset = items.map((it:any)=> ({ id: it.id, line_discount: 0 }))
  if(reset.length){ await s.from('sale_items').upsert(reset) }

  const shop_id = (await s.from('sales').select('shop_id').eq('id', sale_id).single()).data?.shop_id as string
  const promos = await fetchPromotions(shop_id)
  const normalized = items.map((it:any)=> ({
    id: it.id,
    product_id: it.product_id,
    product_name_legacy: it.product_name_legacy,
    qty: Number(it.qty||0),
    unit_price: Number(it.unit_price||0),
    line_discount: 0,
    line_total: Number(it.qty||0)*Number(it.unit_price||0),
    category_id: it.products?.category_id || null
  }))

  const res = applyPromotions(promos as any, normalized)
  // Persist updated discounts back
  for(const u of res.updatedItems){
    await s.from('sale_items').update({ line_discount: u.line_discount, line_total: u.line_total }).eq('id', u.id)
  }

  // Recompute totals
  const subtotal = res.updatedItems.reduce((a:any,c:any)=> a + c.line_total, 0)
  const discount = res.orderDiscount
  const tax = 0
  const total = Math.max(0, subtotal - discount + tax)
  await s.from('sales').update({ subtotal, discount, tax, total }).eq('id', sale_id)
  return { subtotal, discount, tax, total }
}

export async function pay(sale_id: string, method: 'cash' | 'card' | 'ewallet' | 'transfer' | 'other', amount: number){
  const s = sb()
  const { error } = await s.from('payments').insert({ sale_id, method, amount })
  if(error) throw error
  revalidatePath('/(front)/pos')
  return true
}

export async function voidSale(sale_id: string){
  const s = sb()
  const { error } = await s.from('sales').update({ status: 'void' }).eq('id', sale_id)
  if(error) throw error
  revalidatePath('/(front)/pos')
  return true
}
