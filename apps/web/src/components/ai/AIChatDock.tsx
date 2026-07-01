'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, RotateCcw, Send, Loader2 } from 'lucide-react'
import { useAiChat, type ChatMessage, type ToolAction } from '@/lib/hooks/useAiChat'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useCartStore } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'

const QUICK_REPLIES = [
  'Find a gift under $100',
  'Best noise-cancelling earbuds',
  'Compare smartwatches',
  'Track my order',
]

const TOOL_LABELS: Record<string, string> = {
  search_products: 'Searching catalog…',
  get_product: 'Looking up product…',
  recommend: 'Finding recommendations…',
  add_to_cart: 'Adding to cart…',
  get_order_status: 'Checking order…',
}

function ToolChip({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 glass border border-violet/30 rounded-full text-xs text-violet w-fit">
      <Loader2 size={11} className="animate-spin" aria-hidden="true" />
      {TOOL_LABELS[name] ?? `${name}…`}
    </div>
  )
}

function MessageBubble({
  msg,
  isLast,
  streaming,
}: {
  msg: ChatMessage
  isLast: boolean
  streaming: boolean
}) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-violet text-white rounded-br-sm'
            : 'glass border border-[var(--border)] rounded-bl-sm text-[var(--text)]'
        )}
      >
        {msg.content ||
          (isLast && streaming ? (
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-violet rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-violet rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-violet rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          ) : null)}
      </div>
    </div>
  )
}

export function AIChatDock() {
  const open = useUIStore((s) => s.chatOpen)
  const setOpen = useUIStore((s) => s.setChatOpen)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const addToCart = useAddToCart()

  const handleAction = (action: ToolAction) => {
    if (action.type === 'add_to_cart') {
      addToCart.mutate({ productId: action.productId, qty: action.qty, variant: action.variant })
      openDrawer()
    }
  }

  const { messages, streaming, activeTool, error, sendMessage, reset } = useAiChat(handleAction)

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [messages, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSend() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    void sendMessage(text)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <>
      {/* Floating pill trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3 glass border border-violet/40 rounded-full text-sm font-medium text-violet shadow-glow hover:bg-violet/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
          aria-label="Open Lumi AI concierge"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Ask Lumi
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-24px)] flex flex-col glass border border-[var(--border)] rounded-3xl shadow-card overflow-hidden"
          style={{ height: '520px' }}
          role="dialog"
          aria-modal="false"
          aria-label="Lumi AI Shopping Concierge"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
                <span className="text-base" aria-hidden="true">
                  ✦
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Lumi</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">LUMORA concierge</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors"
                  aria-label="Clear conversation"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet/15 flex items-center justify-center">
                  <span className="text-2xl" aria-hidden="true">
                    ✦
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Hi, I&apos;m Lumi</p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Tell me what you&apos;re shopping for.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void sendMessage(q)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs glass border border-[var(--border)] hover:border-violet/40 hover:text-violet transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    isLast={i === messages.length - 1}
                    streaming={streaming}
                  />
                ))}
                {activeTool && <ToolChip name={activeTool.name} />}
                {error && (
                  <p className="text-xs text-danger px-2" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-[var(--border)] shrink-0">
            <div className="flex items-center gap-2 glass border border-[var(--border)] rounded-2xl px-3 py-2 focus-within:border-violet transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about products, orders…"
                disabled={streaming}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)] disabled:opacity-50"
                aria-label="Message Lumi"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="p-1.5 rounded-xl bg-violet text-white disabled:opacity-40 transition-opacity hover:bg-violet/80"
                aria-label="Send message"
              >
                {streaming ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={14} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
