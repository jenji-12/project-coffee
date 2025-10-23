'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function sb(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
}

export async function listStock(shop_id:string){
  const s = sb()
  const { data } = await s.from('stock_items').select('product_id, quantity_on_hand, reorder_point, unit, products:product_id(name, sku, image_path)').eq('shop_id', shop_id).order('products(name)')
  return data||[]
}

export async function listMovements(shop_id:string, limit=100){
  const s = sb()
  const { data } = await s.from('stock_movements').select('created_at, product_id, qty_change, reason, ref_sale_id, note, products:product_id(name)').eq('shop_id', shop_id).order('created_at', { ascending:false }).limit(limit)
  return data||[]
}

export async function receive(shop_id:string, product_id:string, qty:number, note?:string|null){
  const s = sb()
  // movement + update via helper function
  const { error } = await s.rpc('stock_apply_delta', { p_shop: shop_id, p_product: product_id, p_delta: qty, p_reason:'receive', p_sale: null, p_note: note||'receive' } as any)
  if(error){ throw error }
  revalidatePath('/(back)/stock')
  return true
}

export async function issue(shop_id:string, product_id:string, qty:number, note?:string|null){
  const s = sb()
  const { error } = await s.rpc('stock_apply_delta', { p_shop: shop_id, p_product: product_id, p_delta: -Math.abs(qty), p_reason:'issue', p_sale: null, p_note: note||'issue' } as any)
  if(error){ throw error }
  revalidatePath('/(back)/stock')
  return true
}

export async function setReorderPoint(shop_id:string, product_id:string, rp:number){
  const s = sb()
  const { error } = await s.from('stock_items').update({ reorder_point: rp }).match({ shop_id, product_id })
  if(error){ throw error }
  revalidatePath('/(back)/stock')
  return true
}
