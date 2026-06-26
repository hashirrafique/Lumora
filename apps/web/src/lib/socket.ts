import { io, Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function connectSocket(token?: string): Socket {
  const s = getSocket()
  if (token) {
    s.auth = { token }
  }
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect()
  }
}
