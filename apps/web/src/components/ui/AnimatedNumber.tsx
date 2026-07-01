'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: AnimatedNumberProps) {
  const mv = useMotionValue(value)
  const spring = useSpring(mv, { stiffness: 120, damping: 28 })
  const display = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`)
  const prev = useRef(value)

  useEffect(() => {
    if (prev.current !== value) {
      mv.set(value)
      prev.current = value
    }
  }, [value, mv])

  return <motion.span className={className}>{display}</motion.span>
}
