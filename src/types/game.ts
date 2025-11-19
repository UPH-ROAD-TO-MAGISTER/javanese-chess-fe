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
  // Basic move
  legalMove: number // Legal move available (30)

  // Winning
  win: number // Prioritize winning move - 4 aligned cards (10000)

  // Threat detection - 3 opponent cards aligned
  detectThreat3: number // Detect threat: 3 opponent cards aligned (200)
  overwriteThreat: number // Overwrite opponent card during threat (200)
  blockThreatMiddle: number // Block middle of threat formation (75)
  blockThreatEdge: number // Block edge of threat formation (50)
  blockOpponentPath: number // Block opponent's path during threat (100)

  // Threat card values (1-9)
  threatCardValue1: number // Replace card value 1 during threat
  threatCardValue2: number // Replace card value 2 during threat
  threatCardValue3: number // Replace card value 3 during threat
  threatCardValue4: number // Replace card value 4 during threat
  threatCardValue5: number // Replace card value 5 during threat
  threatCardValue6: number // Replace card value 6 during threat
  threatCardValue7: number // Replace card value 7 during threat
  threatCardValue8: number // Replace card value 8 during threat
  threatCardValue9: number // Replace card value 9 during threat

  // Potential threat - adjacent but < 3
  detectPotentialThreat: number // Detect potential threat (base value)
  overwritePotentialThreat: number // Overwrite during potential threat (125)
  blockPotentialPath: number // Block opponent's path for potential threat (70)

  // Potential threat card values (1-9)
  potentialThreatCardValue1: number // Replace card value 1 during potential threat
  potentialThreatCardValue2: number // Replace card value 2 during potential threat
  potentialThreatCardValue3: number // Replace card value 3 during potential threat
  potentialThreatCardValue4: number // Replace card value 4 during potential threat
  potentialThreatCardValue5: number // Replace card value 5 during potential threat
  potentialThreatCardValue6: number // Replace card value 6 during potential threat
  potentialThreatCardValue7: number // Replace card value 7 during potential threat
  potentialThreatCardValue8: number // Replace card value 8 during potential threat
  potentialThreatCardValue9: number // Replace card value 9 during potential threat

  // Own strategy
  create2InRow: number // 2 of own cards aligned (50)
  create3InRow: number // 3 of own cards aligned (100)

  // Card strategy
  playSmallestCard: number // Play the smallest card (60)
  placeNearOwnCard: number // Place card near own card (60)
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
