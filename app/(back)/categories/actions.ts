'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
function sb(){ return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } }) }

export async function listCategories(shop:string){ const s = sb(); return await s.from('categories').select('*').eq('shop_id', shop).order('sort_order') }
export async function upsertCategory(shop:string, data:any){ const s = sb(); data.shop_id=shop; const { data:row, error } = await s.from('categories').upsert(data).select('*').single(); revalidatePath('/(back)/categories'); return { row,error } }
export async function deleteCategory(id:string){ const s = sb(); const { error } = await s.from('categories').delete().eq('id', id); revalidatePath('/(back)/categories'); return { ok:!error,error } }
