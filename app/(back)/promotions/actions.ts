'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function sb(){
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
}

export async function listPromotions(shop:string){
  const s = sb()
  const { data } = await s.from('promotions').select('*').eq('shop_id', shop).order('priority')
  return data||[]
}

export async function upsertPromotion(shop:string, form: FormData){
  const s = sb()
  const id = String(form.get('id')||'')
  const payload:any = {
    id: id || undefined,
    shop_id: shop,
    name: String(form.get('name')),
    priority: Number(form.get('priority')||0),
    is_active: form.get('is_active')==='on',
    starts_at: String(form.get('starts_at')||'') || null,
    ends_at: String(form.get('ends_at')||'') || null,
    rule_json: JSON.parse(String(form.get('rule_json')||'{}'))
  }
  const { error } = await s.from('promotions').upsert(payload).select('*').single()
  if(error) throw error
  revalidatePath('/(back)/promotions')
  return true
}

export async function deletePromotion(id:string){
  const s = sb()
  const { error } = await s.from('promotions').delete().eq('id', id)
  if(error) throw error
  revalidatePath('/(back)/promotions')
  return true
}
