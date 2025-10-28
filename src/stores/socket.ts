import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { SocketEvent } from '@/types/socket'

export const useSocketStore = defineStore('socket', () => {
  // State
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)
  const serverUrl = ref<string>(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000')

  // Getters
  const connectionStatus = computed(() => {
    if (isConnecting.value) return 'connecting'
    if (isConnected.value) return 'connected'
    return 'disconnected'
  })

  // Actions
  function connect() {
    if (socket.value?.connected) {
      console.log('Socket already connected')
      return
    }

    isConnecting.value = true
    error.value = null

    socket.value = io(serverUrl.value, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection events
    socket.value.on('connect', () => {
      console.log('Socket connected:', socket.value?.id)
      isConnected.value = true
      isConnecting.value = false
      error.value = null
    })

    socket.value.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      isConnected.value = false
      isConnecting.value = false
    })

    socket.value.on('connect_error', (err) => {
      console.error('Connection error:', err)
      error.value = err.message
      isConnecting.value = false
      isConnected.value = false
    })

    socket.value.on('error', (err) => {
      console.error('Socket error:', err)
      error.value = err.message || 'Socket error occurred'
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      isConnecting.value = false
    }
  }

  function emit<T = unknown>(event: string, data?: T): void {
    if (!socket.value?.connected) {
      console.warn('Socket not connected, cannot emit event:', event)
      return
    }
    socket.value.emit(event, data)
  }

  function on<T = unknown>(event: string, handler: (data: T) => void): void {
    if (!socket.value) {
      console.warn('Socket not initialized, cannot listen to event:', event)
      return
    }
    socket.value.on(event, handler)
  }

  function off(event: string, handler?: (...args: unknown[]) => void): void {
    if (!socket.value) return
    if (handler) {
      socket.value.off(event, handler)
    } else {
      socket.value.off(event)
    }
  }

  function once<T = unknown>(event: string, handler: (data: T) => void): void {
    if (!socket.value) {
      console.warn('Socket not initialized, cannot listen to event:', event)
      return
    }
    socket.value.once(event, handler)
  }

  return {
    // State
    socket,
    isConnected,
    isConnecting,
    error,
    serverUrl,

    // Getters
    connectionStatus,

    // Actions
    connect,
    disconnect,
    emit,
    on,
    off,
    once,
  }
})
