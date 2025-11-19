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
    />

    <!-- First Turn Modal - Only for Demo Mode -->
    <FirstTurnModal
      v-if="!gameModeStore.isApiMode()"
      :show="showFirstTurnModal"
      :players="gameStore.players"
      @close="showFirstTurnModal = false"
      @start="handleFirstTurnSelected"
    />

    <!-- Win Dialog -->
    <WinDialog
      :is-visible="showWinDialog || showApiWinDialog"
      :winner="(gameModeStore.isApiMode() ? apiGameStore.winner : gameStore.winner) as any"
      :win-type="
        (gameModeStore.isApiMode() ? apiGameStore.winType : gameStore.winCondition?.winType) as any
      "
      :winning-cards="
        gameModeStore.isApiMode()
          ? apiGameStore.winningPositions
          : gameStore.winCondition?.winningCards || []
      "
      @close="handleCloseWinDialog"
      @play-again="handlePlayAgain"
    />

    <!-- First Player Notification (API Mode) -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="gameModeStore.isApiMode() && showFirstPlayerNotification"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click="showFirstPlayerNotification = false"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div
            class="relative glass-strong rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-in"
          >
            <div class="text-center">
              <div class="text-5xl mb-4">🎮</div>
              <h2 class="text-2xl font-black text-white mb-2">Game Started!</h2>
              <p class="text-white/70 text-lg mb-4">
                <span class="text-green-400 font-bold">{{ firstPlayerName }}</span> goes first!
              </p>
              <button
                @click="showFirstPlayerNotification = false"
                class="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Game Info Modal -->
    <GameInfoModal
      :show="showGameInfo"
      :room-code="code"
      :players="gameModeStore.isApiMode() ? apiGameStore.turnOrder : gameStore.players"
      :heuristic-weights="
        roomConfig?.heuristicWeights || {
          legalMove: 30,
          win: 10000,
          detectThreat3: 200,
          overwriteThreat: 200,
          blockThreatMiddle: 75,
          blockThreatEdge: 50,
          blockOpponentPath: 100,
          threatCardValue1: 20,
          threatCardValue2: 30,
          threatCardValue3: 40,
          threatCardValue4: 50,
          threatCardValue5: 60,
          threatCardValue6: 70,
          threatCardValue7: 80,
          threatCardValue8: 90,
          threatCardValue9: 100,
          detectPotentialThreat: 100,
          overwritePotentialThreat: 125,
          blockPotentialPath: 70,
          potentialThreatCardValue1: 100,
          potentialThreatCardValue2: 90,
          potentialThreatCardValue3: 80,
          potentialThreatCardValue4: 70,
          potentialThreatCardValue5: 60,
          potentialThreatCardValue6: 50,
          potentialThreatCardValue7: 40,
          potentialThreatCardValue8: 30,
          potentialThreatCardValue9: 20,
          create2InRow: 50,
          create3InRow: 100,
          playSmallestCard: 60,
          placeNearOwnCard: 60,
        }
      "
      @close="showGameInfo = false"
    />

    <!-- Error Modal -->
    <ErrorModal :show="!!apiError" :message="apiError" is-error @close="apiError = ''" />

    <!-- Last Move Notification (API Mode) -->
    <Teleport to="body">
      <Transition name="slide-down">
        <div
          v-if="gameModeStore.isApiMode() && apiGameStore.lastMove"
          class="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 max-w-md"
        >
          <div class="glass-strong rounded-xl p-4 shadow-2xl border border-white/20">
            <div class="flex items-center gap-3">
              <div class="text-3xl">
                {{ apiGameStore.lastMove.wasReplacement ? '🔄' : '📍' }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-white">{{ apiGameStore.lastMove.playerName }}</span>
                  <span class="text-white/70 text-sm">played</span>
                  <div
                    class="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
                    :class="`bg-player-${apiGameStore.turnOrder.find((p) => p.id === apiGameStore.lastMove?.playerId)?.color || 'blue'}`"
                  >
                    {{ apiGameStore.lastMove.card }}
                  </div>
                </div>
                <div v-if="apiGameStore.lastMove.wasReplacement" class="text-sm text-yellow-400">
                  ⚡ Replaced card {{ apiGameStore.lastMove.replacedValue }} with
                  {{ apiGameStore.lastMove.card }}
                </div>
                <div v-else class="text-sm text-green-400">
                  ✨ Placed at ({{ apiGameStore.lastMove.x }}, {{ apiGameStore.lastMove.y }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
                :board="displayBoard"
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
                v-if="
                  gameModeStore.isApiMode() ? apiGameStore.currentPlayer : gameStore.currentPlayer
                "
                class="flex items-center gap-3 p-3 rounded-lg glass-light"
              >
                <div
                  class="w-5 h-5 rounded-full"
                  :class="`bg-player-${gameModeStore.isApiMode() ? apiGameStore.currentPlayer?.color : gameStore.currentPlayer?.color}`"
                ></div>
                <span class="text-base font-semibold text-white">
                  {{
                    gameModeStore.isApiMode()
                      ? apiGameStore.currentPlayer?.name
                      : gameStore.currentPlayer?.name
                  }}
                </span>
              </div>
              <div v-else class="py-3 text-sm text-center text-white/70">No player turn yet</div>
            </div>

            <!-- Players Grid -->
            <div class="p-4 glass-card">
              <h3 class="mb-3 text-base font-bold text-white">Players</h3>

              <!-- API Mode Players -->
              <div
                v-if="gameModeStore.isApiMode() && apiGameStore.turnOrder.length > 0"
                class="grid grid-cols-2 gap-2"
              >
                <div
                  v-for="player in apiGameStore.turnOrder"
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
                    {{ player.hand.length }} Hand / {{ getRemainingDeck(player.id) }} Deck
                  </div>
                </div>
              </div>

              <!-- Demo Mode Players -->
              <div
                v-else-if="!gameModeStore.isApiMode() && gameStore.players.length > 0"
                class="grid grid-cols-2 gap-2"
              >
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

            <!-- Demo Actions - Only show in Demo Mode -->
            <div v-if="!gameModeStore.isApiMode()" class="p-4 glass-card">
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
                  v-if="!gameModeStore.isApiMode()"
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
import { useApiGameStore } from '@/stores/apiGame'
import { useGameModeStore } from '@/stores/gameMode'
import { wsService } from '@/services/websocket'
import BoardComponent from '@/components/BoardComponent.vue'
import CardHandComponent from '@/components/CardHandComponent.vue'
import WinDialog from '@/components/WinDialog.vue'
import FirstTurnModal from '@/components/FirstTurnModal.vue'
import WaitingRoomModal from '@/components/WaitingRoomModal.vue'
import GameInfoModal from '@/components/GameInfoModal.vue'
import ErrorModal from '@/components/ErrorModal.vue'
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
const apiGameStore = useApiGameStore()
const gameModeStore = useGameModeStore()

const code = ref(route.params.code as string)
const showCoordinates = ref(true)
const selectedCard = ref<Card | null>(null)
const selectedCell = ref<Position | null>(null)
const highlightedCards = ref<string[]>([])
const isDragging = ref(false)
const showMobileMenu = ref(false)
const isBotPlaying = ref(false)
const showWinDialog = ref(false)
const showApiWinDialog = ref(false)
const showFirstTurnModal = ref(false)
const showWaitingRoom = ref(false)
const showGameInfo = ref(false)
const currentPlayerId = ref('')
const isRoomMaster = ref(false)
const roomConfig = ref<RoomConfig | null>(null)
const showFirstPlayerNotification = ref(false)
const firstPlayerName = ref('')
const apiError = ref('')

// Get current human player's cards
const currentPlayerCards = computed((): Card[] => {
  if (gameModeStore.isApiMode()) {
    // API MODE: Use apiGameStore
    return apiGameStore.myHand.map((cardValue, index) => ({
      id: `card-${apiGameStore.myPlayerId}-${cardValue}-${index}`,
      value: cardValue as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
      color: (apiGameStore.myPlayer?.color || 'blue') as PlayerColor,
      playerId: apiGameStore.myPlayerId,
    }))
  } else {
    // DEMO MODE: Use gameStore
    const humanPlayer = gameStore.players.find((p) => !p.isBot)
    return humanPlayer?.cardsInHand || []
  }
})

// Convert API board to frontend board format
const displayBoard = computed(() => {
  if (gameModeStore.isApiMode()) {
    // Convert backend board (BoardCell[][]) to frontend Board format
    return apiGameStore.board.map((row, y) =>
      row.map((cell, x) => ({
        position: { x, y },
        card:
          cell.value > 0
            ? {
                id: `card-${cell.ownerId}-${cell.value}-${x}-${y}`,
                value: cell.value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
                color: (apiGameStore.turnOrder.find((p) => p.id === cell.ownerId)?.color ||
                  'blue') as PlayerColor,
                playerId: cell.ownerId,
              }
            : null,
        isValid: false,
      })),
    )
  } else {
    // DEMO MODE: Use gameStore board directly
    return gameStore.board
  }
})

// Calculate remaining deck cards for each player (API Mode only)
const getRemainingDeck = (playerId: string): number => {
  if (!gameModeStore.isApiMode()) return 0

  const player = apiGameStore.turnOrder.find((p) => p.id === playerId)
  if (!player) return 0

  // Count cards on board for this player
  const cardsOnBoard = apiGameStore.board.flat().filter((cell) => cell.ownerId === playerId).length

  // Total cards = 18, Remaining = 18 - hand - deployed
  return 18 - player.hand.length - cardsOnBoard
}

// Check if it's player's turn
const isPlayerTurn = computed(() => {
  if (gameModeStore.isApiMode()) {
    // API MODE: Check if it's my turn AND game is not finished
    return apiGameStore.isMyTurn && apiGameStore.gameStatus !== 'finished'
  } else {
    // DEMO MODE: Check if current player is not a bot AND game is not finished
    return (
      gameStore.currentPlayer && !gameStore.currentPlayer.isBot && gameStore.status !== 'finished'
    )
  }
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

// Watch for API game status to show win dialog
watch(
  () => apiGameStore.gameStatus,
  (status) => {
    if (status === 'finished' && apiGameStore.winner && gameModeStore.isApiMode()) {
      // Delay dialog so player can see the winning line (1.5s set in store)
      setTimeout(() => {
        showApiWinDialog.value = true
      }, 1500)
    }
  },
)

// Watch for game status change to 'playing' (for guests when game_started event received)
watch(
  () => apiGameStore.gameStatus,
  (status, oldStatus) => {
    if (!gameModeStore.isApiMode()) return

    console.log('🔍 Game status changed:', { old: oldStatus, new: status })

    // When game status is 'playing' and waiting room is still open
    if (status === 'playing' && showWaitingRoom.value) {
      console.log('🎮 Game started! Transitioning from waiting room to game...')

      // Close waiting room
      showWaitingRoom.value = false

      // ✅ No need to reconnect! WebSocket already connected with room_code
      // Just show first player notification
      const firstPlayer = apiGameStore.currentPlayer
      if (firstPlayer) {
        firstPlayerName.value = firstPlayer.name
        showFirstPlayerNotification.value = true

        // Auto-trigger bot if it's bot's turn
        if (firstPlayer.isBot) {
          setTimeout(() => {
            console.log('Triggering first bot move...')
            wsService.sendBotMove(apiGameStore.roomCode)
          }, 1500)
        }
      }
    }
  },
)

// Watch for lobby players changes (when new players join)
watch(
  () => apiGameStore.lobbyPlayers,
  (newLobbyPlayers) => {
    if (!gameModeStore.isApiMode() || !showWaitingRoom.value || !roomConfig.value) return

    console.log('👥 Lobby players updated:', newLobbyPlayers)

    // Update room slots with new players
    const colors: PlayerColor[] = [
      PlayerColor.GREEN,
      PlayerColor.RED,
      PlayerColor.BLUE,
      PlayerColor.PURPLE,
    ]
    const slots: RoomSlot[] = []

    // Add all lobby players as player slots
    newLobbyPlayers.forEach((playerName, index) => {
      const isMe = playerName === localStorage.getItem('playerName')
      slots.push({
        id: `slot-${index}`,
        type: 'player',
        player: {
          id: isMe ? currentPlayerId.value : `player-${index}`,
          name: playerName,
          color: colors[index] || PlayerColor.BLUE,
          isBot: false,
          cardsInHand: [],
          cardsInDeck: [],
          totalCards: 18,
          score: 0,
        },
        color: colors[index] || PlayerColor.BLUE,
      })
    })

    // Add bots
    for (let i = 0; i < roomConfig.value.bots; i++) {
      const slotIndex = slots.length
      slots.push({
        id: `slot-${slotIndex}`,
        type: 'bot',
        player: {
          id: generateBotId(),
          name: `Bot ${i + 1}`,
          color: colors[slotIndex] || PlayerColor.BLUE,
          isBot: true,
          cardsInHand: [],
          cardsInDeck: [],
          totalCards: 18,
          score: 0,
        },
        color: colors[slotIndex] || PlayerColor.BLUE,
      })
    }

    // Add waiting slots for remaining human players
    const remainingHumanSlots = roomConfig.value.humanPlayers - newLobbyPlayers.length
    for (let i = 0; i < remainingHumanSlots; i++) {
      const slotIndex = slots.length
      slots.push({
        id: `slot-${slotIndex}`,
        type: 'waiting',
        color: colors[slotIndex] || PlayerColor.PURPLE,
      })
    }

    gameStore.setRoomSlots(slots)
    console.log('✅ Room slots updated:', slots)
  },
  { deep: true },
)

onMounted(async () => {
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

  // Load player ID (optional for API mode, will be set after joining)
  const playerId = localStorage.getItem('playerId')
  if (!playerId && !gameModeStore.isApiMode()) {
    // Only check playerId for demo mode
    alert('Invalid player session')
    router.push('/')
    return
  }
  if (playerId) {
    currentPlayerId.value = playerId
  }

  // Check if room master
  isRoomMaster.value = localStorage.getItem('isRoomMaster') === 'true'

  // Check game mode
  const savedGameMode = localStorage.getItem('gameMode') as 'demo' | 'api' | null
  if (savedGameMode) {
    gameModeStore.setMode(savedGameMode)
  }

  if (gameModeStore.isApiMode()) {
    // ✅ API MODE: Check if we can restore from saved state (after refresh)
    console.log('API Mode: Checking for saved state...')

    const hasRestoredState = apiGameStore.restoreStateFromStorage()

    if (hasRestoredState && apiGameStore.roomCode === code.value) {
      // State restored successfully - reconnect WebSocket
      console.log('Game state restored from localStorage')

      try {
        await apiGameStore.reconnectWebSocket()
        console.log('WebSocket reconnected successfully')

        // Don't show waiting room, game is already in progress
        showWaitingRoom.value = false

        // Show first player notification if it's the first turn
        if (apiGameStore.currentTurnIndex === 0 && apiGameStore.currentPlayer) {
          firstPlayerName.value = apiGameStore.currentPlayer.name
          showFirstPlayerNotification.value = true
        }

        return // Skip normal initialization
      } catch (error) {
        console.error('Failed to reconnect WebSocket, will need to restart game:', error)
        // Continue to normal flow (show waiting room)
      }
    }

    // Normal flow: Show waiting room for new game
    console.log('API Mode: Loading waiting room...')

    // Load room config
    if (isRoomMaster.value) {
      const savedConfig = localStorage.getItem('roomConfig')
      if (savedConfig) {
        const config = JSON.parse(savedConfig)

        roomConfig.value = {
          roomCode: code.value,
          maxPlayers: 4,
          humanPlayers: config.humanPlayers,
          bots: config.bots,
          waitingSlots: 4 - config.humanPlayers - config.bots,
          roomMaster: playerId || playerName, // Use playerName if playerId not set yet
          heuristicWeights: config.heuristicWeights,
          createdAt: new Date(),
        }

        gameStore.initRoomConfig(roomConfig.value)
        initializeRoomSlots()
        showWaitingRoom.value = true

        // 🔥 NEW: Create lobby and connect to WebSocket
        try {
          console.log('🏠 Room Master: Creating lobby...')
          await apiGameStore.createLobby(code.value, playerName)
          console.log('✅ Lobby created successfully')
        } catch (error) {
          console.error('Failed to create lobby:', error)
          apiError.value = 'Failed to create lobby. Please try again.'
          router.push('/')
        }
      }
    } else {
      // 🔥 NEW: Guest joins the lobby
      try {
        console.log('🚪 Guest: Joining lobby...')
        await apiGameStore.joinLobby(code.value)
        console.log('✅ Joined lobby successfully')
        showWaitingRoom.value = true
      } catch (error) {
        console.error('Failed to join lobby:', error)
        apiError.value = 'Failed to join lobby. Room may not exist.'
        router.push('/')
      }
    }
  } else {
    // ✅ DEMO MODE: Load room config and show waiting room
    console.log('Demo Mode: Initializing waiting room...')

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
          roomMaster: playerId || playerName, // Use playerName if playerId not set yet
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

const handleStartGame = async () => {
  if (gameModeStore.isApiMode()) {
    // ✅ API MODE: Initialize game with backend API
    console.log('API Mode: Calling /api/play...')

    if (!roomConfig.value) {
      alert('Room config not found!')
      return
    }

    // Check if game already initialized (prevent double call)
    if (apiGameStore.gameStatus === 'playing' && apiGameStore.roomCode === code.value) {
      console.log('Game already initialized, skipping API call')
      showWaitingRoom.value = false
      return
    }

    try {
      // Collect all player names from lobby
      const playerNames = apiGameStore.lobbyPlayers

      console.log('🎮 Starting game with player names:', playerNames)
      console.log("📋 Expected format: player_name: ['rama', 'ateng']")

      // Call API to initialize game with ALL player names from lobby
      await apiGameStore.initializeGame({
        playerNames, // Send array: ['rama', 'ateng']
        roomId: code.value,
        numberOfBots: roomConfig.value.bots,
        numberOfPlayers: roomConfig.value.humanPlayers,
        heuristicWeights: roomConfig.value.heuristicWeights,
      })

      // ✅ Close waiting room AFTER API call succeeds
      showWaitingRoom.value = false

      // Save player ID from backend response
      localStorage.setItem('playerId', apiGameStore.myPlayerId)

      console.log('API game initialized successfully')

      // Get first player from turn order
      const firstPlayer = apiGameStore.currentPlayer
      if (firstPlayer) {
        firstPlayerName.value = firstPlayer.name
        showFirstPlayerNotification.value = true

        // Auto-trigger bot if it's bot's turn
        if (firstPlayer.isBot) {
          setTimeout(() => {
            console.log('Triggering first bot move...')
            wsService.sendBotMove(apiGameStore.roomCode)
          }, 1500)
        }
      }
    } catch (error) {
      console.error('Failed to start API game:', error)
      apiError.value =
        error instanceof Error
          ? error.message
          : 'Failed to start game. Please check your connection and try again.'
      showWaitingRoom.value = true // Show waiting room again on error
    }
  } else {
    // ✅ DEMO MODE: Initialize game with players
    console.log('Demo Mode: Initializing local game...')

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
}

const handleCloseWinDialog = () => {
  showWinDialog.value = false
  showApiWinDialog.value = false

  console.log('Win dialog closed - board still visible for review')
}

const handlePlayAgain = () => {
  showWinDialog.value = false
  showApiWinDialog.value = false

  if (gameModeStore.isApiMode()) {
    // API Mode: Reset and go back to home
    apiGameStore.reset()
    router.push('/')
  } else {
    // Demo Mode: Reset and show waiting room again
    showWaitingRoom.value = true
    initializeRoomSlots()
  }
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
  // Prevent interaction if game is finished
  if (gameModeStore.isApiMode() && apiGameStore.gameStatus === 'finished') {
    apiError.value = 'Game is over! Click "Play Again" to start a new game.'
    return
  }

  if (!gameModeStore.isApiMode() && gameStore.status === 'finished') {
    return
  }

  if (!isPlayerTurn.value || isDragging.value) return

  // Mode 1: If we have a selected card, place it on the clicked cell
  if (selectedCard.value) {
    if (gameModeStore.isApiMode()) {
      // ✅ API MODE: Send move to backend
      apiGameStore.makeMove(position.x, position.y, selectedCard.value.value)

      // Clear selection
      selectedCard.value = null
      selectedCell.value = null
      highlightedCards.value = []
    } else {
      // ✅ DEMO MODE: Local game logic
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
  // Prevent interaction if game is finished
  if (gameModeStore.isApiMode() && apiGameStore.gameStatus === 'finished') {
    apiError.value = 'Game is over! Click "Play Again" to start a new game.'
    return
  }

  if (!gameModeStore.isApiMode() && gameStore.status === 'finished') {
    return
  }

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
  // Prevent drag if game is finished
  if (gameModeStore.isApiMode() && apiGameStore.gameStatus === 'finished') {
    apiError.value = 'Game is over! Click "Play Again" to start a new game.'
    return
  }

  if (!gameModeStore.isApiMode() && gameStore.status === 'finished') {
    return
  }

  isDragging.value = true
  console.log('Drag start:', card)
}

const handleCardDragEnd = () => {
  isDragging.value = false
}

const handleCardDrop = (card: Card, position: Position) => {
  console.log('Card dropped:', card, 'at', position)

  // API MODE: Send move via WebSocket
  if (gameModeStore.isApiMode()) {
    console.log('🎮 API Mode: Sending human move...')

    // Check if game is finished
    if (apiGameStore.gameStatus === 'finished') {
      apiError.value = 'Game is over! Click "Play Again" to start a new game.'
      return
    }

    // Validate it's player's turn
    if (!apiGameStore.isMyTurn) {
      apiError.value = "It's not your turn!"
      return
    }

    // Validate move is legal (check vState)
    const targetCell = apiGameStore.board[position.y]?.[position.x]
    if (!targetCell) {
      apiError.value = 'Invalid position!'
      return
    }

    // vState: 0 = not possible, 1 = valid placement, 2 = occupied
    if (targetCell.vState === 0) {
      apiError.value =
        'Invalid move! You can only place cards adjacent to existing cards, or at center for first move.'
      return
    }

    if (targetCell.vState === 2) {
      // Occupied - can only overwrite with higher value card
      if (card.value <= targetCell.value) {
        apiError.value = `Cannot overwrite! You need a card higher than ${targetCell.value} to replace this position.`
        return
      }
      // Card value is higher - allow overwrite
      console.log(`✅ Overwriting card ${targetCell.value} with ${card.value}`)
    }

    // ✅ Valid move - Do optimistic update for instant feedback
    console.log('⚡ Optimistic update: Placing card on board...')
    targetCell.value = card.value
    targetCell.vState = 2 // occupied
    targetCell.ownerId = apiGameStore.myPlayerId

    // Remove card from hand optimistically
    const myPlayer = apiGameStore.myPlayer
    if (myPlayer) {
      const cardIndex = myPlayer.hand.indexOf(card.value)
      if (cardIndex !== -1) {
        myPlayer.hand.splice(cardIndex, 1)
        console.log('⚡ Optimistic update: Removed card from hand')
      }
    }

    // Send to backend - backend response will be authoritative
    apiGameStore.makeMove(position.x, position.y, card.value)
    return
  }

  // DEMO MODE: Handle locally
  // Validate it's player's turn
  if (!isPlayerTurn.value) {
    apiError.value = "It's not your turn!"
    return
  }

  // Check if move is valid
  if (!gameStore.isValidMove(position, card)) {
    apiError.value =
      'Invalid move! You can only place cards adjacent to existing cards, or at center for first move.'
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
  // Clear both stores
  gameStore.resetGame()

  if (gameModeStore.isApiMode()) {
    apiGameStore.reset()
  }

  router.push('/')
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translate(-50%, -100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
