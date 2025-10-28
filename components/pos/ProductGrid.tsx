// components/pos/ProductGrid.tsx
'use client'
import React from 'react'
type Item = { id: string|number; name: string; price?: number }
type Props = { items?: Item[]; onSelect?: (id: Item) => void }
export default function ProductGrid({ items = [], onSelect }: Props) {
  if (!items.length) items = [{ id: 1, name: 'Americano', price: 55 }]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map(it => (
        <button
          key={it.id}
          className="rounded border p-3 hover:bg-gray-50 text-left"
          onClick={() => onSelect?.(it)}
        >
          <div className="font-medium">{it.name}</div>
          {it.price != null && <div className="text-sm opacity-70">฿{it.price}</div>}
        </button>
      ))}
    </div>
  )
}
