import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GameState,
  Board,
  Player,
  Card,
  Position,
  Move,
  BoardCell,
  GameStatus,
  WinCondition,
} from '@/types/game'
import { PlayerColor } from '@/types/game'

/**
 * Initialize empty 9x9 board
 */
function createEmptyBoard(): Board {
  const board: Board = []
  for (let y = 0; y < 9; y++) {
    const row: BoardCell[] = []
    for (let x = 0; x < 9; x++) {
      row.push({
        position: { x, y },
        card: null,
        isValid: false,
      })
    }
    board.push(row)
  }
  return board
}

export const useGameStore = defineStore('game', () => {
  // State
  const roomCode = ref<string>('')
  const status = ref<GameStatus>('waiting' as GameStatus)
  const board = ref<Board>(createEmptyBoard())
  const players = ref<Player[]>([])
  const currentPlayerIndex = ref<number>(0)
  const moveHistory = ref<Move[]>([])
  const winner = ref<Player | null>(null)
  const winCondition = ref<WinCondition | null>(null)
  const firstMove = ref<boolean>(true)
  const selectedCard = ref<Card | null>(null)

  // Getters
  const currentPlayer = computed<Player | null>(() => {
    if (players.value.length === 0) return null
    return players.value[currentPlayerIndex.value] || null
  })

  const gameState = computed<GameState>(() => ({
    roomCode: roomCode.value,
    status: status.value,
    board: board.value,
    players: players.value,
    currentPlayerIndex: currentPlayerIndex.value,
    currentPlayer: currentPlayer.value,
    moveHistory: moveHistory.value,
    winner: winner.value,
    winCondition: winCondition.value,
    firstMove: firstMove.value,
  }))

  const isMyTurn = computed(() => {
    const player = currentPlayer.value
    return player && !player.isBot
  })

  // Actions
  function initGame(code: string, gamePlayers: Player[]) {
    roomCode.value = code
    players.value = gamePlayers
    board.value = createEmptyBoard()
    moveHistory.value = []
    winner.value = null
    winCondition.value = null
    firstMove.value = true
    currentPlayerIndex.value = 0
    status.value = 'waiting' as GameStatus // Start in waiting state for first turn modal
  }

  function setFirstPlayer(player: Player) {
    const playerIndex = players.value.findIndex((p) => p.id === player.id)
    if (playerIndex !== -1) {
      currentPlayerIndex.value = playerIndex
      status.value = 'in_progress' as GameStatus
    }
  }

  function resetGame() {
    roomCode.value = ''
    status.value = 'waiting' as GameStatus
    board.value = createEmptyBoard()
    players.value = []
    currentPlayerIndex.value = 0
    moveHistory.value = []
    winner.value = null
    winCondition.value = null
    firstMove.value = true
    selectedCard.value = null
  }

  function selectCard(card: Card | null) {
    selectedCard.value = card
  }

  function placeCard(card: Card, position: Position): boolean {
    const cell = board.value[position.y]?.[position.x]
    if (!cell) return false

    // Validate move
    if (!isValidMove(position, card)) return false

    // If replacing a card, remove the old card (it's captured)
    if (cell.card) {
      console.log(
        `Card ${cell.card.value} replaced by ${card.value} at (${position.x}, ${position.y})`,
      )
    }

    // Place card on board
    cell.card = card
    cell.isValid = false

    // Add to move history
    const move: Move = {
      playerId: card.playerId,
      card,
      position,
      timestamp: Date.now(),
    }
    moveHistory.value.push(move)

    // Update first move flag
    if (firstMove.value) {
      firstMove.value = false
    }

    // Clear selected card
    selectedCard.value = null

    // Check for win condition after placing card
    const winCheck = checkWinCondition(card.playerId)
    if (winCheck.isWin) {
      setWinner(card.playerId, winCheck)
    }

    return true
  }

  function checkWinCondition(playerId: string): WinCondition {
    // Check all positions on board for 4 in a row
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = board.value[y]?.[x]
        if (!cell?.card || cell.card.playerId !== playerId) continue

        // Check horizontal (right)
        if (x <= 5) {
          const positions: Position[] = []
          let isWin = true
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y]?.[x + i]
            if (!checkCell?.card || checkCell.card.playerId !== playerId) {
              isWin = false
              break
            }
            positions.push({ x: x + i, y })
          }
          if (isWin) {
            return {
              isWin: true,
              winnerId: playerId,
              winningCards: positions,
              winType: 'horizontal',
            }
          }
        }

        // Check vertical (down)
        if (y <= 5) {
          const positions: Position[] = []
          let isWin = true
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y + i]?.[x]
            if (!checkCell?.card || checkCell.card.playerId !== playerId) {
              isWin = false
              break
            }
            positions.push({ x, y: y + i })
          }
          if (isWin) {
            return {
              isWin: true,
              winnerId: playerId,
              winningCards: positions,
              winType: 'vertical',
            }
          }
        }

        // Check diagonal down-right
        if (x <= 5 && y <= 5) {
          const positions: Position[] = []
          let isWin = true
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y + i]?.[x + i]
            if (!checkCell?.card || checkCell.card.playerId !== playerId) {
              isWin = false
              break
            }
            positions.push({ x: x + i, y: y + i })
          }
          if (isWin) {
            return {
              isWin: true,
              winnerId: playerId,
              winningCards: positions,
              winType: 'diagonal',
            }
          }
        }

        // Check diagonal down-left
        if (x >= 3 && y <= 5) {
          const positions: Position[] = []
          let isWin = true
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y + i]?.[x - i]
            if (!checkCell?.card || checkCell.card.playerId !== playerId) {
              isWin = false
              break
            }
            positions.push({ x: x - i, y: y + i })
          }
          if (isWin) {
            return {
              isWin: true,
              winnerId: playerId,
              winningCards: positions,
              winType: 'diagonal',
            }
          }
        }
      }
    }

    return { isWin: false }
  }

  function isValidMove(position: Position, card: Card): boolean {
    const cell = board.value[position.y]?.[position.x]
    if (!cell) return false

    // First move must be center (4,4)
    if (firstMove.value) {
      return position.x === 4 && position.y === 4
    }

    // Check if position is adjacent to any placed card
    if (!isAdjacentToPlacedCard(position)) {
      return false
    }

    // If cell is empty, it's valid
    if (!cell.card) return true

    // If cell has a card, new card must have higher value
    return card.value > cell.card.value
  }

  function isAdjacentToPlacedCard(position: Position): boolean {
    const { x, y } = position
    const directions: [number, number][] = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]

    for (const [dx, dy] of directions) {
      const newX = x + dx
      const newY = y + dy
      if (newX >= 0 && newX < 9 && newY >= 0 && newY < 9) {
        const cell = board.value[newY]?.[newX]
        if (cell?.card !== null) {
          return true
        }
      }
    }
    return false
  }

  function calculateValidMoves(card: Card): Position[] {
    const validPositions: Position[] = []

    // First move: only center is valid
    if (firstMove.value) {
      return [{ x: 4, y: 4 }]
    }

    // Check all positions
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const position = { x, y }
        if (isValidMove(position, card)) {
          validPositions.push(position)
        }
      }
    }

    return validPositions
  }

  function highlightValidMoves(card: Card | null) {
    // Reset all highlights
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = board.value[y]?.[x]
        if (cell) {
          cell.isValid = false
        }
      }
    }

    // Highlight valid moves for selected card
    if (card) {
      const validPositions = calculateValidMoves(card)
      for (const pos of validPositions) {
        const cell = board.value[pos.y]?.[pos.x]
        if (cell) {
          cell.isValid = true
        }
      }
    }
  }

  function nextTurn() {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
  }

  function updateBoard(newBoard: Board) {
    board.value = newBoard
  }

  function setWinner(playerId: string, condition: WinCondition) {
    const winningPlayer = players.value.find((p) => p.id === playerId)
    if (winningPlayer) {
      winner.value = winningPlayer
      winCondition.value = condition
      status.value = 'finished' as GameStatus
    }
  }

  return {
    // State
    roomCode,
    status,
    board,
    players,
    currentPlayerIndex,
    moveHistory,
    winner,
    winCondition,
    firstMove,
    selectedCard,

    // Getters
    currentPlayer,
    gameState,
    isMyTurn,

    // Actions
    initGame,
    setFirstPlayer,
    resetGame,
    selectCard,
    placeCard,
    isValidMove,
    calculateValidMoves,
    highlightValidMoves,
    checkWinCondition,
    nextTurn,
    updateBoard,
    setWinner,
  }
})
