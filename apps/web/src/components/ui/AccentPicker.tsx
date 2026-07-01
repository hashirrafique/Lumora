'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useUIStore, type AccentColor } from '@/store/ui.store'
import { spring } from '@/lib/motion'

const ACCENTS: { value: AccentColor; label: string; color: string; ring: string }[] = [
  { value: 'violet', label: 'Violet', color: '#7C5CFF', ring: 'ring-[#7C5CFF]' },
  { value: 'blue', label: 'Blue', color: '#3B82F6', ring: 'ring-[#3B82F6]' },
  { value: 'green', label: 'Green', color: '#10B981', ring: 'ring-[#10B981]' },
  { value: 'orange', label: 'Orange', color: '#F97316', ring: 'ring-[#F97316]' },
]

interface AccentPickerProps {
  className?: string
}

export function AccentPicker({ className }: AccentPickerProps) {
  const accent = useUIStore((s) => s.accent)
  const setAccent = useUIStore((s) => s.setAccent)

  return (
    <div className={className}>
      <p className="text-xs text-[var(--muted)] mb-2 font-medium">Accent color</p>
      <div className="flex items-center gap-2">
        {ACCENTS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => setAccent(a.value)}
            aria-label={`Set accent to ${a.label}`}
            aria-pressed={accent === a.value}
            className={`relative w-7 h-7 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${a.ring} ${accent === a.value ? 'ring-2 ring-offset-2 ring-offset-[var(--surface)]' : ''}`}
            style={{ backgroundColor: a.color }}
          >
            {accent === a.value && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={spring.snappy}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check size={12} className="text-white" aria-hidden="true" />
              </motion.span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
