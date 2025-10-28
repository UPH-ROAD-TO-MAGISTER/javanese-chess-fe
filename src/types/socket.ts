import type { Card, Move, Player, Position, WinCondition } from './game'

/**
 * Socket event types
 */
export enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Room management
  CREATE_ROOM = 'create-room',
  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  ROOM_CREATED = 'room-created',
  ROOM_JOINED = 'room-joined',
  PLAYER_JOINED = 'player-joined',
  PLAYER_LEFT = 'player-left',

  // Game flow
  START_GAME = 'start-game',
  GAME_STARTED = 'game-started',
  GAME_STATE_UPDATE = 'game-state-update',

  // Player moves
  PLAYER_MOVE = 'player-move',
  MOVE_SUCCESS = 'move-success',
  MOVE_INVALID = 'move-invalid',
  BOT_MOVE = 'bot-move',

  // Game end
  GAME_OVER = 'game-over',
  DRAW = 'draw',
}

/**
 * Socket payloads
 */
export interface CreateRoomPayload {
  playerName: string
  numberOfBots: number
}

export interface JoinRoomPayload {
  roomCode: string
  playerName: string
}

export interface PlayerMovePayload {
  roomCode: string
  playerId: string
  card: Card
  position: Position
}

export interface BotMovePayload {
  botId: string
  holdCards: Card[]
}

export interface MoveSuccessPayload {
  move: Move
  nextPlayerId: string
  updatedBoard: any // Board state from backend
}

export interface GameOverPayload {
  winnerId: string
  winCondition: WinCondition
  finalScores: {
    playerId: string
    score: number
  }[]
}

/**
 * Socket response wrapper
 */
export interface SocketResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
