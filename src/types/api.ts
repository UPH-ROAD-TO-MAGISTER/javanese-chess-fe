/**
 * API Types for Backend Integration
 */

// Backend Heuristic Weights Structure (from API)
export interface BackendWeights {
  w_win: number
  w_threat: number
  w_replace_value: number
  w_block_path: number
  w_build_alignment: number
  w_card_cost: number
  legal_move: number
  replace_values_threat: Record<string, number>
  replace_values_potential: Record<string, number>
  replace_when_threat: number
  replace_potential: number
  replace_pos_middle: number
  replace_pos_side: number
  block_when_threat: number
  block_potential: number
  build_alignment_2: number
  build_alignment_3: number
  play_smallest_card: number
  keep_near_card: number
}

// Default Heuristic Response
export interface DefaultHeuristicResponse {
  weights: BackendWeights
}

// Board Cell Structure (from backend)
export interface BoardCell {
  value: number // 0 = empty, 1-9 = card value
  vState: number // 0 = empty, 1 = occupied
  ownerId: string // player/bot ID
}

// Board Structure
export interface BackendBoard {
  size: number
  cells: BoardCell[][]
}

// Player/Bot in Turn Order
export interface TurnOrderPlayer {
  id: string
  name: string
  isBot: boolean
  hand: number[] // Card values in hand
  deck: number[] // Remaining cards in deck
  color?: string // Player color
}

// Play Game Request
export interface PlayGameRequest {
  number_bot: number
  number_player: number
  player_name: string[] // Array of player names for multiplayer
  room_id: string
  weights: BackendWeights
}

// Join Room Request
export interface JoinRoomRequest {
  room_code: string
  player_name: string
}

// Join Room Response
export interface JoinRoomResponse {
  success: boolean
  data: {
    room_code: string
    player_id: string
    status: 'lobby' | 'playing' | 'finished'
  }
}

// Play Game Response
export interface PlayGameResponse {
  success: boolean
  data: {
    board: BackendBoard
    players: TurnOrderPlayer[] // Changed from turn_order to match actual response
    room_code: string
    status: 'waiting' | 'playing' | 'finished'
    turn_order: string[] // Array of player IDs indicating turn sequence
  }
}

// WebSocket Actions (Messages sent TO backend)
export interface WSRoomCreated {
  action: 'room_created'
  data: {
    room_code: string
    player_name: string
  }
}

export interface WSHumanMove {
  action: 'human_move'
  data: {
    player_id: string
    x: number
    y: number
    card: number
  }
}

export interface WSBotMove {
  action: 'bot_move'
  data: {
    room_code: string
  }
}

export type WSMessage = WSRoomCreated | WSHumanMove | WSBotMove

// WebSocket Events (Messages received FROM backend)

// Room created confirmation
export interface WSRoomCreatedResponse {
  action: 'room_created'
  data: {
    room_code: string
    status: 'lobby'
  }
}

// New player joined notification
export interface WSNewPlayerJoinedResponse {
  action: 'new_player_joined'
  data: {
    player_name: string
  }
}

// Game started broadcast
export interface WSGameStartedResponse {
  action: 'game_started'
  data: {
    board: BackendBoard
    players: TurnOrderPlayer[]
    room_code: string
    status: 'playing'
    turn_order: string[]
  }
}

// Main event: state-updated - sent after every move (human or bot)
export interface WSStateUpdatedResponse {
  action: 'state-updated'
  data: {
    room: {
      code: string
      board: BackendBoard
      players: TurnOrderPlayer[]
      turn_idx: number // Current turn index in turn_order
      winner_id: string | null
      draw: boolean
      created_at: string
      room_config: {
        room_code: string
        weights: BackendWeights
      }
      turn_order: string[] // Array of player IDs
    }
  }
}

export interface WSGameEndResponse {
  action: 'game_end'
  data: {
    winner: {
      id: string
      name: string
      isBot: boolean
    }
    win_type: 'horizontal' | 'vertical' | 'diagonal' | 'draw'
    winning_positions?: Array<{ x: number; y: number }>
  }
}

export interface WSErrorResponse {
  action: 'error'
  data: {
    message: string
    code?: string
  }
}

export type WSEvent =
  | WSRoomCreatedResponse
  | WSNewPlayerJoinedResponse
  | WSGameStartedResponse
  | WSStateUpdatedResponse
  | WSGameEndResponse
  | WSErrorResponse
