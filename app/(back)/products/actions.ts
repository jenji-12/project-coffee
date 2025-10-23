'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function sb(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth: { persistSession: false } })
}

export async function listProducts(shop_id:string){
  const s = sb()
  return await s.from('products').select('*').eq('shop_id', shop_id).order('created_at', { ascending: false })
}

export async function getProduct(id:string){
  const s = sb()
  return await s.from('products').select('*').eq('id', id).single()
}

export async function upsertProduct(shop_id:string, data:any){
  const s = sb()
  data.shop_id = shop_id
  const { data: row, error } = await s.from('products').upsert(data).select('*').single()
  revalidatePath('/(back)/products')
  return { row, error }
}

export async function deleteProduct(id:string){
  const s = sb()
  const { error } = await s.from('products').delete().eq('id', id)
  revalidatePath('/(back)/products')
  return { ok: !error, error }
}
