export type Role = 'owner'|'manager'|'cashier'
export function canManageShop(role: Role){ return role === 'owner' || role === 'manager' }
export function canViewAudit(role: Role){ return role === 'owner' || role === 'manager' }
export function canSell(role: Role){ return role === 'owner' || role === 'manager' || role === 'cashier' }
