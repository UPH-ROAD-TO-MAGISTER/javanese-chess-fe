<template>
  <div class="min-h-[100dvh] p-2 overflow-hidden">
    <!-- First Turn Modal -->
    <FirstTurnModal
      :show="showFirstTurnModal"
      :players="gameStore.players"
      @close="showFirstTurnModal = false"
      @start="handleFirstTurnSelected"
    />

    <!-- Win Dialog -->
    <WinDialog
      :is-visible="showWinDialog"
      :winner="gameStore.winner"
      :win-type="gameStore.winCondition?.winType"
      :winning-cards="gameStore.winCondition?.winningCards"
      @close="showWinDialog = false"
      @play-again="handlePlayAgain"
    />

    <div class="max-w-7xl mx-auto h-[calc(100dvh-1rem)]">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-2 h-full">
        <!-- Game Board & Cards Section -->
        <div class="flex flex-col gap-2 min-h-0 order-1">
          <!-- Board -->
          <div class="glass-card p-2 flex-1 min-h-0 overflow-auto">
            <div class="flex justify-between items-center mb-2 gap-2">
              <h2 class="text-sm font-semibold text-white">Javanese Chess</h2>
              <div class="flex gap-2">
                <button
                  @click="toggleCoordinates"
                  class="glass-light text-white text-xs px-1.5 py-0.5 rounded text-[10px]"
                >
                  {{ showCoordinates ? 'Hide' : 'Show' }} Coords
                </button>
                <button
                  @click="toggleMobileMenu"
                  class="lg:hidden glass-light text-white text-xs px-1.5 py-0.5 rounded text-[10px]"
                >
                  {{ showMobileMenu ? 'Close' : 'Menu' }}
                </button>
              </div>
            </div>

            <div class="min-h-fit">
              <BoardComponent
                :board="gameStore.board"
                :show-coordinates="showCoordinates"
                :selected-card="selectedCard"
                :selected-cell="selectedCell"
                @cell-click="handleCellClick"
                @card-drop="handleCardDrop"
              />
            </div>
          </div>

          <!-- Player's Cards -->
          <CardHandComponent
            v-if="currentPlayerCards.length > 0"
            :cards="currentPlayerCards"
            :disabled="!isPlayerTurn"
            :is-player-turn="isPlayerTurn ?? false"
            :selected-card="selectedCard"
            :highlighted-cards="highlightedCards"
            @card-click="handleCardClick"
            @card-drag-start="handleCardDragStart"
            @card-drag-end="handleCardDragEnd"
          />
        </div>

        <!-- Side Panel (Desktop) / Mobile Menu Overlay -->
        <div
          class="space-y-2 overflow-y-auto max-h-full order-2 transition-all duration-300"
          :class="{
            'hidden lg:block': !showMobileMenu,
            'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm p-4 flex items-start justify-center pt-20':
              showMobileMenu,
          }"
          @click.self="showMobileMenu && toggleMobileMenu()"
        >
          <div
            class="space-y-2"
            :class="{
              'lg:static lg:transform-none': true,
              'glass-strong p-4 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto':
                showMobileMenu,
            }"
          >
            <!-- Current Turn -->
            <div class="glass-card p-4">
              <h3 class="text-base font-bold text-white mb-3">Current Turn</h3>
              <div
                v-if="gameStore.currentPlayer"
                class="flex items-center gap-3 glass-light rounded-lg p-3"
              >
                <div
                  class="w-5 h-5 rounded-full"
                  :class="`bg-player-${gameStore.currentPlayer.color}`"
                ></div>
                <span class="text-white text-base font-semibold">
                  {{ gameStore.currentPlayer.name }}
                </span>
              </div>
              <div v-else class="text-white/70 text-sm text-center py-3">No player turn yet</div>
            </div>

            <!-- Players Grid -->
            <div class="glass-card p-4">
              <h3 class="text-base font-bold text-white mb-3">Players</h3>
              <div v-if="gameStore.players.length > 0" class="grid grid-cols-2 gap-2">
                <div
                  v-for="player in gameStore.players"
                  :key="player.id"
                  class="glass-light rounded-lg p-2.5"
                >
                  <div class="flex items-center gap-2 mb-1.5">
                    <div
                      class="w-4 h-4 rounded-full flex-shrink-0"
                      :class="`bg-player-${player.color}`"
                    ></div>
                    <span class="text-white text-sm font-semibold truncate">
                      {{ player.name }}
                    </span>
                    <span
                      v-if="player.isBot"
                      class="text-[11px] glass px-2 py-0.5 rounded text-white/70 ml-auto font-medium"
                    >
                      BOT
                    </span>
                  </div>
                  <div class="text-white/70 text-xs leading-tight">
                    {{ player.cardsInHand.length }} Hand / {{ player.cardsInDeck.length }} Deck
                  </div>
                </div>
              </div>
              <div v-else class="text-white/70 text-sm text-center py-3">No players yet</div>
            </div>

            <!-- Demo Actions -->
            <div class="glass-card p-4">
              <h3 class="text-base font-bold text-white mb-3">Demo Actions</h3>
              <div class="space-y-2">
                <button
                  @click="handleResetGame"
                  class="w-full glass-strong hover:bg-white/30 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all"
                >
                  🔄 Restart Game
                </button>
                <button
                  @click="placeRandomCard"
                  :disabled="gameStore.players.length === 0 || gameStore.status !== 'in_progress'"
                  class="w-full glass-strong hover:bg-white/30 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Random Card
                </button>
                <button
                  @click="resetBoard"
                  class="w-full glass-light hover:bg-white/15 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all"
                >
                  Clear Board
                </button>
              </div>
            </div>

            <!-- Room Info -->
            <div class="glass-card p-4">
              <div class="mb-3">
                <p class="text-white/80 text-sm mb-2">
                  Room: <span class="font-mono text-white font-bold">{{ code }}</span>
                </p>
                <span
                  class="text-xs glass px-3 py-1 rounded-full text-white/70 inline-block font-medium"
                >
                  Demo Mode
                </span>
              </div>
              <button
                @click="leaveRoom"
                class="w-full glass-light hover:bg-white/15 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'
import BoardComponent from '@/components/BoardComponent.vue'
import CardHandComponent from '@/components/CardHandComponent.vue'
import WinDialog from '@/components/WinDialog.vue'
import FirstTurnModal from '@/components/FirstTurnModal.vue'
import { PlayerColor, type Card, type Player, type Position } from '@/types/game'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

const code = ref(route.params.code as string)
const showCoordinates = ref(true)
const selectedCard = ref<Card | null>(null)
const selectedCell = ref<Position | null>(null)
const highlightedCards = ref<string[]>([])
const isDragging = ref(false)
const showMobileMenu = ref(false)
const isBotPlaying = ref(false)
const showWinDialog = ref(false)
const showFirstTurnModal = ref(false)
const isGameInitialized = ref(false)

// Get current human player's cards
const currentPlayerCards = computed(() => {
  const humanPlayer = gameStore.players.find((p) => !p.isBot)
  return humanPlayer?.cardsInHand || []
})

// Check if it's player's turn
const isPlayerTurn = computed(() => {
  return gameStore.currentPlayer && !gameStore.currentPlayer.isBot
})

// Watch for bot turns and auto-play
watch(
  () => gameStore.currentPlayer,
  (currentPlayer) => {
    // Only auto-play if game is in progress (not waiting for first turn)
    if (
      currentPlayer?.isBot &&
      !isBotPlaying.value &&
      gameStore.status === 'in_progress'
    ) {
      // Bot's turn - play automatically after a short delay
      isBotPlaying.value = true
      setTimeout(() => {
        botPlayTurn()
        isBotPlaying.value = false
      }, 1000) // 1 second delay to make it visible
    }
  },
  { immediate: true },
)

// Watch for game status to show win dialog
watch(
  () => gameStore.status,
  (status) => {
    if (status === 'finished' && gameStore.winner) {
      // Delay dialog slightly so player can see the winning move
      setTimeout(() => {
        showWinDialog.value = true
      }, 500)
    }
  },
)

onMounted(() => {
  if (!code.value) {
    router.push('/')
    return
  }

  // Auto-initialize game on first load
  if (!isGameInitialized.value && gameStore.players.length === 0) {
    initDemoGame()
    isGameInitialized.value = true
    // Show first turn modal after initialization
    setTimeout(() => {
      showFirstTurnModal.value = true
    }, 500)
  }
})

const toggleCoordinates = () => {
  showCoordinates.value = !showCoordinates.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handlePlayAgain = () => {
  showWinDialog.value = false
  initDemoGame()
  // Show first turn modal again
  setTimeout(() => {
    showFirstTurnModal.value = true
  }, 500)
}

const handleFirstTurnSelected = (firstPlayer: Player) => {
  gameStore.setFirstPlayer(firstPlayer)
  showFirstTurnModal.value = false
}

const handleResetGame = () => {
  initDemoGame()
  isGameInitialized.value = true
  setTimeout(() => {
    showFirstTurnModal.value = true
  }, 500)
}

// Bot plays turn automatically
const botPlayTurn = () => {
  const currentPlayer = gameStore.currentPlayer
  if (!currentPlayer || !currentPlayer.isBot || currentPlayer.cardsInHand.length === 0) {
    return
  }

  // Get all valid moves for all cards in bot's hand
  const validMoves: { card: Card; position: Position }[] = []

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const position = { x, y }
      const cell = gameStore.board[y]?.[x]
      if (cell && !cell.card) {
        // Check each card in bot's hand
        currentPlayer.cardsInHand.forEach((card) => {
          if (gameStore.isValidMove(position, card)) {
            validMoves.push({ card, position })
          }
        })
      }
    }
  }

  if (validMoves.length === 0) {
    console.log('Bot has no valid moves, skipping turn')
    gameStore.nextTurn()
    return
  }

  // Pick a random valid move
  const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
  if (!randomMove) return

  // Place the card
  const success = gameStore.placeCard(randomMove.card, randomMove.position)

  if (success) {
    // Remove card from bot's hand
    currentPlayer.cardsInHand = currentPlayer.cardsInHand.filter((c) => c.id !== randomMove.card.id)

    // Draw a new card from deck if available
    if (currentPlayer.cardsInDeck.length > 0) {
      const newCard = currentPlayer.cardsInDeck.shift()
      if (newCard) {
        currentPlayer.cardsInHand.push(newCard)
      }
    }

    // Next turn
    gameStore.nextTurn()
  }
}

// Get legal cards for a selected cell
const getLegalCardsForCell = (position: Position): string[] => {
  if (!isPlayerTurn.value) return []

  const player = gameStore.currentPlayer
  if (!player) return []

  const legalCards: string[] = []

  // Check each card in hand
  player.cardsInHand.forEach((card) => {
    if (gameStore.isValidMove(position, card)) {
      legalCards.push(card.id)
    }
  })

  return legalCards
}

const handleCellClick = (position: Position) => {
  if (!isPlayerTurn.value || isDragging.value) return

  // Mode 1: If we have a selected card, place it on the clicked cell
  if (selectedCard.value) {
    const player = gameStore.currentPlayer
    if (!player) return

    const success = gameStore.placeCard(selectedCard.value, position)
    if (success) {
      // Remove card from player's hand
      player.cardsInHand = player.cardsInHand.filter((c) => c.id !== selectedCard.value!.id)

      // Draw a new card from deck if available
      if (player.cardsInDeck.length > 0) {
        const newCard = player.cardsInDeck.shift()
        if (newCard) {
          player.cardsInHand.push(newCard)
        }
      }

      selectedCard.value = null
      selectedCell.value = null
      highlightedCards.value = []
      console.log('Card placed successfully!')

      // Next turn - this will trigger bot auto-play via watch
      gameStore.nextTurn()
    }
    return
  }

  // Mode 2: Cell clicked first - highlight legal cards for this position
  selectedCell.value = position
  highlightedCards.value = getLegalCardsForCell(position)

  if (highlightedCards.value.length === 0) {
    console.log('No legal cards for this position')
    // Reset if no legal moves
    selectedCell.value = null
  }
}

const handleCardClick = (card: Card) => {
  if (!isPlayerTurn.value) return

  // Mode 1: If cell was selected first and this card is highlighted, deploy it
  if (selectedCell.value && highlightedCards.value.includes(card.id)) {
    const success = gameStore.placeCard(card, selectedCell.value)
    if (success) {
      const player = gameStore.currentPlayer
      if (player) {
        // Remove card from player's hand
        player.cardsInHand = player.cardsInHand.filter((c) => c.id !== card.id)

        // Draw a new card from deck if available
        if (player.cardsInDeck.length > 0) {
          const newCard = player.cardsInDeck.shift()
          if (newCard) {
            player.cardsInHand.push(newCard)
          }
        }
      }

      selectedCard.value = null
      selectedCell.value = null
      highlightedCards.value = []
      console.log('Card placed successfully!')

      // Next turn - this will trigger bot auto-play via watch
      gameStore.nextTurn()
    }
    return
  }

  // Mode 2: Card selected first (original behavior)
  // Toggle selection
  if (selectedCard.value?.id === card.id) {
    selectedCard.value = null
    selectedCell.value = null
    highlightedCards.value = []
  } else {
    selectedCard.value = card
    selectedCell.value = null
    highlightedCards.value = []
  }
}

const handleCardDragStart = (card: Card) => {
  isDragging.value = true
  console.log('Drag start:', card)
}

const handleCardDragEnd = () => {
  isDragging.value = false
}

const handleCardDrop = (card: Card, position: Position) => {
  console.log('Card dropped:', card, 'at', position)

  // Validate it's player's turn
  if (!isPlayerTurn.value) {
    alert("It's not your turn!")
    return
  }

  // Check if move is valid
  if (!gameStore.isValidMove(position, card)) {
    alert(
      'Invalid move! You can only place cards adjacent to existing cards, or at center for first move.',
    )
    return
  }

  // Place the card (game store will handle card replacement logic)
  const success = gameStore.placeCard(card, position)

  if (!success) {
    alert('Cannot place card here!')
    return
  }

  // Remove card from player's hand
  const humanPlayer = gameStore.players.find((p) => !p.isBot)
  if (humanPlayer) {
    humanPlayer.cardsInHand = humanPlayer.cardsInHand.filter((c) => c.id !== card.id)

    // Draw a new card from deck if available
    if (humanPlayer.cardsInDeck.length > 0) {
      const newCard = humanPlayer.cardsInDeck.shift()
      if (newCard) {
        humanPlayer.cardsInHand.push(newCard)
      }
    }
  }

  // Next turn
  gameStore.nextTurn()

  // Reset selections
  selectedCard.value = null
  selectedCell.value = null
  highlightedCards.value = []
}

const initDemoGame = () => {
  // Helper function to create cards for a player
  const createCardsForPlayer = (playerId: string, color: PlayerColor) => {
    const allCards: Card[] = []
    // Each player has 2 cards of each value (1-9) = 18 cards total
    for (let value = 1; value <= 9; value++) {
      for (let count = 0; count < 2; count++) {
        allCards.push({
          id: `${playerId}-card-${value}-${count}`,
          value: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
          color: color,
          playerId: playerId,
        })
      }
    }
    // Shuffle cards
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = allCards[i]
      const swap = allCards[j]
      if (temp && swap) {
        allCards[i] = swap
        allCards[j] = temp
      }
    }
    return allCards
  }

  // Create 4 players: 1 human + 3 bots with different colors
  const players: Player[] = [
    {
      id: 'player-1',
      name: 'You',
      color: PlayerColor.GREEN,
      isBot: false,
      cardsInHand: [],
      cardsInDeck: [],
      totalCards: 18,
      score: 0,
    },
    {
      id: 'bot-1',
      name: 'Bot Red',
      color: PlayerColor.RED,
      isBot: true,
      cardsInHand: [],
      cardsInDeck: [],
      totalCards: 18,
      score: 0,
    },
    {
      id: 'bot-2',
      name: 'Bot Blue',
      color: PlayerColor.BLUE,
      isBot: true,
      cardsInHand: [],
      cardsInDeck: [],
      totalCards: 18,
      score: 0,
    },
    {
      id: 'bot-3',
      name: 'Bot Purple',
      color: PlayerColor.PURPLE,
      isBot: true,
      cardsInHand: [],
      cardsInDeck: [],
      totalCards: 18,
      score: 0,
    },
  ]

  // Distribute cards to each player
  players.forEach((player) => {
    const allCards = createCardsForPlayer(player.id, player.color)
    player.cardsInHand = allCards.slice(0, 5) // First 5 cards in hand
    player.cardsInDeck = allCards.slice(5) // Remaining 13 cards in deck
  })

  gameStore.initGame(code.value, players)
}

function placeRandomCard() {
  if (gameStore.players.length === 0) {
    alert('Please initialize demo game first')
    return
  }

  // Get random empty position
  const emptyPositions: { x: number; y: number }[] = []
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const cell = gameStore.board[y]?.[x]
      if (cell && !cell.card) {
        emptyPositions.push({ x, y })
      }
    }
  }

  if (emptyPositions.length === 0) {
    alert('Board is full!')
    return
  }

  // If first move, place at center
  let position: { x: number; y: number }
  if (gameStore.firstMove) {
    position = { x: 4, y: 4 }
  } else {
    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
    if (!randomPos) return
    position = randomPos
  }

  // Create random card
  const currentPlayer = gameStore.currentPlayer
  if (!currentPlayer) return

  const card: Card = {
    id: `card-${Date.now()}`,
    value: (Math.floor(Math.random() * 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    color: currentPlayer.color,
    playerId: currentPlayer.id,
  }

  // Place card
  gameStore.placeCard(card, position)
  gameStore.nextTurn()
}

function resetBoard() {
  gameStore.resetGame()
}

function leaveRoom() {
  gameStore.resetGame()
  router.push('/')
}
</script>
