import { createClient } from '@supabase/supabase-js'

export async function audit(shop_id: string, user_id: string|null, action: string, subject: string, data?: any){
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ persistSession:false } })
  await s.from('audit_logs').insert({ shop_id, user_id, action, subject, data: data??null })
}
