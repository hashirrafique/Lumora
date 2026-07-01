export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  inOut: [0.76, 0, 0.24, 1] as const,
}

export const duration = { fast: 0.15, base: 0.3, slow: 0.5 }

export const spring = {
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 18 },
  gentle: { type: 'spring' as const, stiffness: 180, damping: 28 },
}
