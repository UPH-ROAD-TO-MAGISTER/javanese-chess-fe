<template>
  <div class="min-h-[100dvh] p-2 overflow-hidden">
    <!-- Waiting Room Modal -->
    <WaitingRoomModal
      :show="showWaitingRoom"
      :room-code="code"
      :slots="gameStore.roomSlots"
      :room-master="roomConfig?.roomMaster || ''"
      :current-player-id="currentPlayerId"
      @start="handleStartGame"
      @convert-to-bot="handleConvertToBot"
      @leave="handleLeaveWaitingRoom"
    />

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

    <!-- Game Info Modal -->
    <GameInfoModal
      :show="showGameInfo"
      :room-code="code"
      :players="gameStore.players"
      :heuristic-weights="
        roomConfig?.heuristicWeights || {
          win: 10000,
          blockOpponent3: 5000,
          create3InRow: 1000,
          create2InRow: 100,
          cardValue: 10,
          centerControl: 5,
          replacement: 50,
        }
      "
      @close="showGameInfo = false"
    />

    <div class="max-w-7xl mx-auto h-[calc(100dvh-1rem)]">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-2 h-full">
        <!-- Game Board & Cards Section -->
        <div class="flex flex-col order-1 min-h-0 gap-2">
          <!-- Board -->
          <div class="flex-1 min-h-0 p-2 overflow-auto glass-card">
            <div class="flex items-center justify-between gap-2 mb-2">
              <h2 class="text-sm font-semibold text-white">Javanese Chess</h2>
              <div class="flex gap-2">
                <button
                  @click="showGameInfo = true"
                  class="glass-light hover:bg-white/15 text-white text-xs py-1.5 px-3 rounded transition-all"
                  title="Game Information"
                >
                  Game Info
                </button>
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
          class="order-2 max-h-full space-y-2 overflow-y-auto transition-all duration-300"
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
            <div class="p-4 glass-card">
              <h3 class="mb-3 text-base font-bold text-white">Current Turn</h3>
              <div
                v-if="gameStore.currentPlayer"
                class="flex items-center gap-3 p-3 rounded-lg glass-light"
              >
                <div
                  class="w-5 h-5 rounded-full"
                  :class="`bg-player-${gameStore.currentPlayer.color}`"
                ></div>
                <span class="text-base font-semibold text-white">
                  {{ gameStore.currentPlayer.name }}
                </span>
              </div>
              <div v-else class="py-3 text-sm text-center text-white/70">No player turn yet</div>
            </div>

            <!-- Players Grid -->
            <div class="p-4 glass-card">
              <h3 class="mb-3 text-base font-bold text-white">Players</h3>
              <div v-if="gameStore.players.length > 0" class="grid grid-cols-2 gap-2">
                <div
                  v-for="player in gameStore.players"
                  :key="player.id"
                  class="glass-light rounded-lg p-2.5"
                >
                  <div class="flex items-center gap-2 mb-1.5">
                    <div
                      class="flex-shrink-0 w-4 h-4 rounded-full"
                      :class="`bg-player-${player.color}`"
                    ></div>
                    <span class="text-sm font-semibold text-white truncate">
                      {{ player.name }}
                    </span>
                    <span
                      v-if="player.isBot"
                      class="text-[11px] glass px-2 py-0.5 rounded text-white/70 ml-auto font-medium"
                    >
                      BOT
                    </span>
                  </div>
                  <div class="text-xs leading-tight text-white/70">
                    {{ player.cardsInHand.length }} Hand / {{ player.cardsInDeck.length }} Deck
                  </div>
                </div>
              </div>
              <div v-else class="py-3 text-sm text-center text-white/70">No players yet</div>
            </div>

            <!-- Demo Actions -->
            <div class="p-4 glass-card">
              <h3 class="mb-3 text-base font-bold text-white">Demo Actions</h3>
              <div class="space-y-2">
                <button
                  @click="handleResetGame"
                  class="w-full glass-strong hover:bg-white/30 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all"
                >
                  Restart Game
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
            <div class="p-4 glass-card">
              <div class="mb-3">
                <p class="mb-2 text-sm text-white/80">
                  Room: <span class="font-mono font-bold text-white">{{ code }}</span>
                </p>
                <span
                  class="inline-block px-3 py-1 text-xs font-medium rounded-full glass text-white/70"
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
import WaitingRoomModal from '@/components/WaitingRoomModal.vue'
import GameInfoModal from '@/components/GameInfoModal.vue'
import {
  PlayerColor,
  type Card,
  type Player,
  type Position,
  type RoomSlot,
  type RoomConfig,
} from '@/types/game'
import { generateBotId, generateCardId } from '@/utils/id'

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
const showWaitingRoom = ref(false)
const showGameInfo = ref(false)
const currentPlayerId = ref('')
const isRoomMaster = ref(false)
const roomConfig = ref<RoomConfig | null>(null)

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
    if (currentPlayer?.isBot && !isBotPlaying.value && gameStore.status === 'in_progress') {
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

  // Validate player name - if not found, redirect to home
  const playerName = localStorage.getItem('playerName')
  if (!playerName || playerName.trim().length < 2) {
    alert('Please enter your name first')
    router.push('/')
    return
  }

  // Load player ID
  const playerId = localStorage.getItem('playerId')
  if (!playerId) {
    alert('Invalid player session')
    router.push('/')
    return
  }
  currentPlayerId.value = playerId

  // Check if room master
  isRoomMaster.value = localStorage.getItem('isRoomMaster') === 'true'

  // Load room config if room master
  if (isRoomMaster.value) {
    const savedConfig = localStorage.getItem('roomConfig')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)

      // Initialize full room config
      roomConfig.value = {
        roomCode: code.value,
        maxPlayers: 4,
        humanPlayers: config.humanPlayers,
        bots: config.bots,
        waitingSlots: 4 - config.humanPlayers - config.bots,
        roomMaster: playerId,
        heuristicWeights: config.heuristicWeights,
        createdAt: new Date(),
      }

      gameStore.initRoomConfig(roomConfig.value)

      // Initialize room slots
      initializeRoomSlots()

      // Show waiting room modal
      showWaitingRoom.value = true
    }
  } else {
    // For joiners, show waiting room (in real implementation, get from WebSocket)
    // For now, just show a message
    alert('Join room feature will be implemented with WebSocket')
    router.push('/')
  }
})

// Initialize room slots based on config
function initializeRoomSlots() {
  if (!roomConfig.value) return

  const slots: RoomSlot[] = []
  const colors: PlayerColor[] = [
    PlayerColor.GREEN,
    PlayerColor.RED,
    PlayerColor.BLUE,
    PlayerColor.PURPLE,
  ]
  const playerName = localStorage.getItem('playerName') || 'Player'

  // First slot is always the room creator (human player)
  const creatorPlayer: Player = {
    id: currentPlayerId.value,
    name: playerName,
    color: colors[0]!,
    isBot: false,
    cardsInHand: [],
    cardsInDeck: [],
    totalCards: 18,
    score: 0,
  }

  slots.push({
    id: `slot-0`,
    type: 'player',
    player: creatorPlayer,
    color: colors[0]!,
  })

  // Add bots (already decided at room creation)
  for (let i = 0; i < roomConfig.value.bots; i++) {
    const slotIndex = slots.length
    const botPlayer: Player = {
      id: generateBotId(),
      name: `Bot ${i + 1}`,
      color: colors[slotIndex] || PlayerColor.BLUE,
      isBot: true,
      cardsInHand: [],
      cardsInDeck: [],
      totalCards: 18,
      score: 0,
    }

    slots.push({
      id: `slot-${slotIndex}`,
      type: 'bot',
      player: botPlayer,
      color: colors[slotIndex] || PlayerColor.BLUE,
    })
  }

  // Add waiting slots for other human players (humanPlayers - 1 because creator already joined)
  const waitingHumanSlots = roomConfig.value.humanPlayers - 1
  for (let i = 0; i < waitingHumanSlots; i++) {
    const slotIndex = slots.length
    slots.push({
      id: `slot-${slotIndex}`,
      type: 'waiting', // Waiting for human players to join
      color: colors[slotIndex] || PlayerColor.PURPLE,
    })
  }

  // Calculate remaining empty slots (4 total - creator - bots - waiting)
  const totalUsedSlots = 1 + roomConfig.value.bots + waitingHumanSlots
  const emptySlots = 4 - totalUsedSlots

  // Add empty slots (can add bots here)
  for (let i = 0; i < emptySlots; i++) {
    const slotIndex = slots.length
    slots.push({
      id: `slot-${slotIndex}`,
      type: 'waiting', // Using 'waiting' type, but will show as "Empty slot"
      color: colors[slotIndex] || PlayerColor.PURPLE,
    })
  }

  gameStore.setRoomSlots(slots)
}

const toggleCoordinates = () => {
  showCoordinates.value = !showCoordinates.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// Waiting Room handlers
const handleConvertToBot = (slotIndex: number) => {
  gameStore.convertSlotToBot(slotIndex)

  // Update the slot's player with a bot
  const slot = gameStore.roomSlots[slotIndex]
  if (slot) {
    const botPlayer: Player = {
      id: generateBotId(),
      name: `Bot ${slotIndex + 1}`,
      color: slot.color,
      isBot: true,
      cardsInHand: [],
      cardsInDeck: [],
      totalCards: 18,
      score: 0,
    }
    slot.player = botPlayer
  }
}

const handleStartGame = () => {
  // Close waiting room
  showWaitingRoom.value = false

  // Collect all players from slots (excluding waiting)
  const activePlayers = gameStore.roomSlots
    .filter((slot) => slot.type === 'player' || slot.type === 'bot')
    .map((slot) => slot.player!)

  // Initialize game with players
  initDemoGameWithPlayers(activePlayers)

  // Show first turn modal
  setTimeout(() => {
    showFirstTurnModal.value = true
  }, 500)
}

const handleLeaveWaitingRoom = () => {
  router.push('/')
}

const handlePlayAgain = () => {
  showWinDialog.value = false

  // Reset and show waiting room again
  showWaitingRoom.value = true
  initializeRoomSlots()
}

const handleFirstTurnSelected = (firstPlayer: Player) => {
  gameStore.setFirstPlayer(firstPlayer)
  showFirstTurnModal.value = false
}

const handleResetGame = () => {
  showWaitingRoom.value = true
  initializeRoomSlots()
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

// Initialize game with specific players (from waiting room)
const initDemoGameWithPlayers = (activePlayers: Player[]) => {
  // Helper function to create cards for a player
  const createCardsForPlayer = (playerId: string, color: PlayerColor) => {
    const allCards: Card[] = []
    // Each player has 2 cards of each value (1-9) = 18 cards total
    for (let value = 1; value <= 9; value++) {
      for (let count = 0; count < 2; count++) {
        allCards.push({
          id: generateCardId(),
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

  // Distribute cards to each player
  activePlayers.forEach((player) => {
    const allCards = createCardsForPlayer(player.id, player.color)
    player.cardsInHand = allCards.slice(0, 5) // First 5 cards in hand
    player.cardsInDeck = allCards.slice(5) // Remaining 13 cards in deck
  })

  gameStore.initGame(code.value, activePlayers)
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
