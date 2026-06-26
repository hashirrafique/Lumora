'use client'

import { useState, useCallback, useRef } from 'react'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ToolAction {
  type: 'add_to_cart'
  productId: string
  qty: number
  variant?: { name: string; value: string }
  title?: string
}

export type ToolStatus = 'running' | 'done'

export interface ActiveTool {
  name: string
  status: ToolStatus
}

export function useAiChat(onAction?: (action: ToolAction) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    if (streaming) return
    setError(null)

    const userMsg: ChatMessage = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setStreaming(true)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    let assistantContent = ''
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-20) }),
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error('Request failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        let currentEvent = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim()
            try {
              const payload = JSON.parse(raw) as Record<string, unknown>

              if (currentEvent === 'delta') {
                const chunk = payload['text'] as string
                assistantContent += chunk
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last?.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, content: assistantContent }
                  }
                  return updated
                })
              } else if (currentEvent === 'tool') {
                setActiveTool({ name: payload['name'] as string, status: payload['status'] as ToolStatus })
                if ((payload['status'] as string) === 'done') {
                  setTimeout(() => setActiveTool(null), 800)
                }
              } else if (currentEvent === 'actions') {
                const actions = payload['tool_actions'] as ToolAction[]
                for (const action of actions) {
                  onAction?.(action)
                }
              }
            } catch {
              // malformed SSE chunk — skip
            }
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return
      setError('Something went wrong. Please try again.')
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant' && !last.content) {
          updated.pop()
        }
        return updated
      })
    } finally {
      setStreaming(false)
      setActiveTool(null)
      abortRef.current = null
    }
  }, [messages, streaming, onAction])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setStreaming(false)
    setActiveTool(null)
    setError(null)
  }, [])

  return { messages, streaming, activeTool, error, sendMessage, reset }
}
