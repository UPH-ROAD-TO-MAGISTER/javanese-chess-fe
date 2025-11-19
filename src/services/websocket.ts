/**
 * WebSocket Service for Real-time Game Communication
 */

import type { WSMessage } from '@/types/api'

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://98.70.41.170:9000'

type WSEventCallback = (data: Record<string, unknown>) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Set<WSEventCallback>> = new Map()
  private roomCode: string | null = null

  /**
   * Connect to WebSocket server
   * @param roomCode - Optional room code. If not provided, connects to lobby WebSocket
   */
  connect(roomCode?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.roomCode = roomCode || null
        // For lobby phase, connect without room_code parameter
        // For in-game phase, connect with room_code parameter
        const wsUrl = roomCode ? `${WS_BASE_URL}/ws?room_code=${roomCode}` : `${WS_BASE_URL}/ws`
        console.log('🔌 Connecting to WebSocket:', wsUrl)
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected to room:', roomCode)
          console.log('🔍 WebSocket readyState:', this.ws?.readyState)
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          console.log('📨 Raw WebSocket message:', event.data)
          try {
            const data = JSON.parse(event.data)
            console.log('📨 Parsed WebSocket data:', data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.handleDisconnect()
        }
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.roomCode = null
    }
  }

  /**
   * Send message to server
   */
  send(message: WSMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket is not connected')
      return
    }

    try {
      console.log('📤 Sending WebSocket message:', message)
      this.ws.send(JSON.stringify(message))
      console.log('✅ Message sent successfully')
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
    }
  }

  /**
   * Send room created notification
   */
  sendRoomCreated(roomCode: string, playerName: string) {
    console.log('🏠 Sending room_created for room:', roomCode)
    this.send({
      action: 'room_created',
      data: {
        room_code: roomCode,
        player_name: playerName,
      },
    })
  }

  /**
   * Send human move
   */
  sendHumanMove(playerId: string, x: number, y: number, card: number) {
    this.send({
      action: 'human_move',
      data: {
        player_id: playerId,
        x,
        y,
        card,
      },
    })
  }

  /**
   * Request bot move
   */
  sendBotMove(roomCode: string) {
    console.log('🤖 Requesting bot move for room:', roomCode)
    this.send({
      action: 'bot_move',
      data: {
        room_code: roomCode,
      },
    })
  }

  /**
   * Register event listener
   */
  on(event: string, callback: WSEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  /**
   * Unregister event listener
   */
  off(event: string, callback: WSEventCallback) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: Record<string, unknown>) {
    console.log('📨 WebSocket message received:', data)

    // Determine event type from message structure
    let eventType = 'message'

    if (data.action && typeof data.action === 'string') {
      eventType = data.action
      console.log('🎯 Event type detected:', eventType)
      
      // 🔥 Special highlight for game_started event
      if (eventType === 'game_started') {
        console.log('🎮🎮🎮 GAME_STARTED EVENT DETECTED! 🎮🎮🎮')
        console.log('📦 Full event data:', JSON.stringify(data, null, 2))
      }
    } else if (
      data.data &&
      typeof data.data === 'object' &&
      data.data !== null &&
      'next_player' in data.data
    ) {
      eventType = 'move-made'
    } else if (
      data.data &&
      typeof data.data === 'object' &&
      data.data !== null &&
      'game_ended' in data.data
    ) {
      eventType = 'game-end'
    }

    console.log(
      '🔔 Emitting event:',
      eventType,
      'to',
      this.listeners.get(eventType)?.size || 0,
      'listeners',
    )

    // Emit to all listeners for this event
    const eventListeners = this.listeners.get(eventType)
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    } else {
      console.warn('⚠️ No listeners registered for event:', eventType)
    }

    // Also emit to generic 'message' listeners
    if (eventType !== 'message') {
      const messageListeners = this.listeners.get('message')
      if (messageListeners) {
        messageListeners.forEach((callback) => {
          try {
            callback(data)
          } catch (error) {
            console.error('Error in message listener:', error)
          }
        })
      }
    }
  }

  /**
   * Handle WebSocket disconnect
   */
  private handleDisconnect() {
    // Emit disconnect event
    const disconnectListeners = this.listeners.get('disconnect')
    if (disconnectListeners) {
      disconnectListeners.forEach((callback) => callback({}))
    }

    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomCode) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      )

      setTimeout(() => {
        if (this.roomCode) {
          this.connect(this.roomCode).catch((error) => {
            console.error('Reconnection failed:', error)
          })
        }
      }, this.reconnectDelay)
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Export singleton instance
export const wsService = new WebSocketService()
