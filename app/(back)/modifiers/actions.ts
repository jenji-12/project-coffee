'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
function sb(){ return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } }) }

export async function listGroups(shop:string){
  const s = sb()
  const { data } = await s.from('modifier_groups').select('id,name,min_select,max_select,required').eq('shop_id', shop).order('name')
  return data||[]
}
export async function upsertGroup(shop:string, data:any){
  const s = sb(); data.shop_id = shop
  const { data: row, error } = await s.from('modifier_groups').upsert(data).select('*').single()
  revalidatePath('/(back)/modifiers'); return { row, error }
}
export async function deleteGroup(id:string){ const s = sb(); const { error } = await s.from('modifier_groups').delete().eq('id', id); revalidatePath('/(back)/modifiers'); return { ok:!error, error } }

export async function listModifiers(group_id:string){
  const s = sb(); const { data } = await s.from('modifiers').select('*').eq('group_id', group_id).order('sort_order'); return data||[]
}
export async function upsertModifier(group_id:string, data:any){
  const s = sb(); data.group_id = group_id
  const { data: row, error } = await s.from('modifiers').upsert(data).select('*').single()
  return { row, error }
}
export async function deleteModifier(id:string){ const s = sb(); const { error } = await s.from('modifiers').delete().eq('id', id); return { ok:!error, error } }

export async function linkProductToGroup(product_id:string, group_id:string){
  const s = sb(); const { error } = await s.from('product_modifier_groups').upsert({ product_id, group_id }); return { ok:!error, error }
}
export async function unlinkProductFromGroup(product_id:string, group_id:string){
  const s = sb(); const { error } = await s.from('product_modifier_groups').delete().match({ product_id, group_id }); return { ok:!error, error }
}
