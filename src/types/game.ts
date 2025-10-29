/**
 * Card value (1-9)
 */
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/**
 * Player colors
 */
export enum PlayerColor {
  GREEN = 'green',
  RED = 'red',
  BLUE = 'blue',
  PURPLE = 'purple',
}

/**
 * Card interface
 */
export interface Card {
  id: string
  value: CardValue
  color: PlayerColor
  playerId: string
}

/**
 * Position on board (0-8 for 9x9 grid)
 */
export interface Position {
  x: number
  y: number
}

/**
 * Cell on the board
 */
export interface BoardCell {
  position: Position
  card: Card | null
  isValid?: boolean // For highlighting valid moves
}

/**
 * Board state (9x9 grid)
 */
export type Board = BoardCell[][]

/**
 * Player interface
 */
export interface Player {
  id: string
  name: string
  color: PlayerColor
  isBot: boolean
  cardsInHand: Card[] // Max 3 cards
  cardsInDeck: Card[] // Remaining cards (shuffled)
  totalCards: number // Total 18 cards
  score: number // For tie-breaker
}

/**
 * Move action
 */
export interface Move {
  playerId: string
  card: Card
  position: Position
  timestamp: number
}

/**
 * Game state enum
 */
export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  PAUSED = 'paused',
}

/**
 * Win condition result
 */
export interface WinCondition {
  isWin: boolean
  winnerId?: string
  winningCards?: Position[] // Positions of winning cards
  winType?: 'horizontal' | 'vertical' | 'diagonal'
}

/**
 * Game state interface
 */
export interface GameState {
  roomCode: string
  roomConfig: RoomConfig
  roomSlots: RoomSlot[]
  status: GameStatus
  board: Board
  players: Player[]
  currentPlayerIndex: number
  currentPlayer: Player | null
  moveHistory: Move[]
  winner: Player | null
  winCondition: WinCondition | null
  firstMove: boolean // Track if first move (must be center)
}

/**
 * Heuristic weights for bot AI
 */
export interface HeuristicWeights {
  win: number // Weight for winning move (4-in-a-row)
  blockOpponent3: number // Weight for blocking opponent's 3-in-a-row
  create3InRow: number // Weight for creating 3-in-a-row
  create2InRow: number // Weight for creating 2-in-a-row
  cardValue: number // Weight for card value
  centerControl: number // Weight for center control
  replacement: number // Weight for replacing opponent card
}

/**
 * Room slot - can be player, bot, or waiting
 */
export interface RoomSlot {
  id: string
  type: 'player' | 'bot' | 'waiting'
  player?: Player
  color: PlayerColor
}

/**
 * Room configuration
 */
export interface RoomConfig {
  roomCode: string
  maxPlayers: number // Total slots (always 4)
  humanPlayers: number // Number of human player slots
  bots: number // Number of bot slots
  waitingSlots: number // Empty slots waiting for players
  roomMaster: string // Player ID of room creator
  heuristicWeights: HeuristicWeights
  createdAt: Date
}
