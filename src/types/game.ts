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
 * Room configuration
 */
export interface RoomConfig {
  roomCode: string
  maxPlayers: number
  numberOfBots: number
  createdAt: Date
  createdBy: string
}
