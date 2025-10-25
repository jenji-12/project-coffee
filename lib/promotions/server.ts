import { createClient } from '@supabase/supabase-js'
import { Promotion } from './types'

export async function fetchPromotions(shop_id: string){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE!
  const s = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await s.from('promotions').select('*').eq('shop_id', shop_id).eq('is_active', true).order('priority')
  return (data||[]) as Promotion[]
}
