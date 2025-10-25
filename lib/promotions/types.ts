export type RuleType = 'percent'|'amount'|'buyxgety'|'combo'

export type PercentRule = {
  type: 'percent',
  percent: number,            // e.g., 10 = 10%
  scope: 'order' | 'category' | 'product',
  product_ids?: string[],
  category_ids?: string[],
  min_subtotal?: number
}

export type AmountRule = {
  type: 'amount',
  amount: number,
  scope: 'order' | 'category' | 'product',
  product_ids?: string[],
  category_ids?: string[],
  min_subtotal?: number
}

export type BuyXGetYRule = {
  type: 'buyxgety',
  buy: { product_id: string, qty: number },
  get: { product_id: string, qty: number, discount: 'free' | 'percent' | 'amount', value?: number }
}

export type ComboRule = {
  type: 'combo',
  items: { product_id: string, qty: number }[],
  bundle_price: number
}

export type PromotionRule = PercentRule | AmountRule | BuyXGetYRule | ComboRule

export type Promotion = {
  id: string
  shop_id: string
  name: string
  priority: number
  is_active: boolean
  starts_at?: string|null
  ends_at?: string|null
  rule_json: PromotionRule
}

export type SaleItemLike = {
  id: string
  product_id?: string|null
  product_name_legacy?: string|null
  qty: number
  unit_price: number
  line_discount: number
  line_total: number
  category_id?: string|null
}

export type ApplyResult = {
  updatedItems: SaleItemLike[]
  orderDiscount: number
}
