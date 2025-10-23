'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { guard } from '@/lib/authServer'
import { audit } from '@/lib/audit'

function sbSvc(){ return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } }) }

export async function addUser(shop_id: string, user_id: string, role: 'owner'|'manager'|'cashier'){
  await guard(shop_id, 'manage')
  const s = sbSvc()
  const { error } = await s.from('shop_users').upsert({ shop_id, user_id, role })
  if(error) throw error
  await audit(shop_id, null, 'shop_user.upsert', user_id, { role })
  revalidatePath('/(back)/shops/users')
}

export async function removeUser(shop_id: string, user_id: string){
  await guard(shop_id, 'manage')
  const s = sbSvc()
  const { error } = await s.from('shop_users').delete().match({ shop_id, user_id })
  if(error) throw error
  await audit(shop_id, null, 'shop_user.remove', user_id)
  revalidatePath('/(back)/shops/users')
}
