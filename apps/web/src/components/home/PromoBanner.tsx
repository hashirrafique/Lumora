'use client'

import { Bot, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/ui.store'

export function PromoBanner() {
  const openChat = useUIStore((s) => s.setChatOpen)

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-label="AI concierge promotion">
      <div className="relative overflow-hidden rounded-3xl border border-violet/20 bg-gradient-to-r from-violet/10 via-cyan/5 to-transparent p-8 sm:p-12">
        {/* Background blobs */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C5CFF, transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-1/2 w-60 h-60 rounded-full blur-[60px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22D3EE, transparent)' }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 border border-violet/20 text-violet text-xs font-medium mb-4">
              <Zap size={11} aria-hidden="true" />
              Powered by AI
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] mb-4 leading-tight">
              Meet{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(92deg, #7C5CFF, #22D3EE)',
                }}
              >
                Lumi
              </span>
              , your AI
              <br className="hidden sm:block" /> shopping concierge
            </h2>
            <p className="text-[var(--muted)] text-base max-w-md mx-auto lg:mx-0 leading-relaxed mb-6">
              Tell Lumi what you&apos;re looking for and get instant, personalised product picks.
              Compare specs, check availability, and add to cart — all in one conversation.
            </p>
            <button
              onClick={() => openChat(true)}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              <Bot size={16} aria-hidden="true" />
              Chat with Lumi
            </button>
          </div>

          {/* Visual */}
          <div className="shrink-0 w-full max-w-xs lg:max-w-sm">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="glass rounded-3xl border border-violet/20 p-5 shadow-card"
            >
              {/* Mock chat UI */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border)]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text)]">Lumi</p>
                  <p className="text-[10px] text-success">● Online</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="glass rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-[var(--text)] max-w-[80%]">
                  Hi! I&apos;m looking for wireless headphones under $300
                </div>
                <div className="ml-auto glass rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-[var(--text)] max-w-[85%] bg-violet/10 border border-violet/20">
                  Great choice! Here are 3 picks I recommend for you...
                </div>
                <div className="flex gap-2">
                  {['Sony WH-1000XM5', 'AirPods Pro'].map((name) => (
                    <div key={name} className="flex-1 glass rounded-xl px-2 py-1.5">
                      <p className="text-[10px] font-medium text-[var(--text)] truncate">{name}</p>
                      <p className="text-[10px] text-violet">★★★★★</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
