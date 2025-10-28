// components/pos/CategoriesTabs.tsx
'use client'
import React from 'react'
type Props = { active?: string; onChange?: (key: string) => void }
const tabs = ['all', 'coffee', 'tea', 'bakery']
export default function CategoriesTabs({ active = 'all', onChange }: Props) {
  return (
    <div className="flex gap-2">
      {tabs.map(t => (
        <button
          key={t}
          className={`px-3 py-1 rounded ${t===active ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => onChange?.(t)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
