import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function getSession(){
  // Server component/session reader
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string){ return cookieStore.get(name)?.value } }
  })
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

export async function getRole(shop_id: string, user_id: string){
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  const { data } = await s.from('shop_users').select('role').match({ shop_id, user_id }).single()
  return data?.role || null
}

export async function guard(shop_id: string, need: 'sell'|'manage'|'audit'){
  const user = await getSession()
  if(!user) throw new Error('UNAUTHENTICATED')
  const role = await getRole(shop_id, user.id)
  if(!role) throw new Error('FORBIDDEN')
  if(need==='sell' && !['owner','manager','cashier'].includes(role)) throw new Error('FORBIDDEN')
  if(need==='manage' && !['owner','manager'].includes(role)) throw new Error('FORBIDDEN')
  if(need==='audit' && !['owner','manager'].includes(role)) throw new Error('FORBIDDEN')
  return { user, role }
}
