<template>
  <div class="relative flex items-center justify-center min-h-screen overflow-hidden home-view">
    <!-- Version Badge -->
    <div class="absolute top-4 right-4 glass-card px-3 py-1.5 z-10">
      <p class="text-xs font-bold text-white/80">v1.0.0</p>
    </div>

    <!-- Main Content -->
    <div class="relative z-20 w-full max-w-4xl px-4">
      <!-- Centered Image (no wrap) -->
      <div class="mb-6 text-center animate-fade-in">
        <img
          src="/background.png"
          alt="Javanese Chess"
          class="w-full max-w-2xl mx-auto rounded-xl"
        />
      </div>

      <!-- Glass Card with all content -->
      <div class="max-w-2xl p-6 mx-auto glass-card md:p-8">
        <!-- Subtitle -->
        <div class="mb-6 text-center">
          <p class="text-xl font-medium text-white md:text-2xl">
            Strategic Card Placement • 2-4 Players
          </p>
        </div>

        <!-- Primary Action Buttons -->
        <div class="mb-6 space-y-3 animate-slide-up">
          <button
            @click="createRoom"
            class="relative w-full px-8 py-5 overflow-hidden text-xl font-black text-white transition-all duration-300 transform border shadow-xl glass-strong rounded-xl hover:scale-105 border-white/30 group"
            style="
              background:
                linear-gradient(135deg, rgba(34, 197, 94, 0.5), rgba(16, 185, 129, 0.5)),
                rgba(0, 0, 0, 0.3);
            "
          >
            <span class="relative z-10">🎮 PLAY</span>
            <div
              class="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 group-hover:opacity-100"
            ></div>
          </button>

          <button
            @click="showJoinDialog = true"
            class="relative w-full px-8 py-5 overflow-hidden text-xl font-black text-white transition-all duration-300 transform border shadow-xl glass-strong rounded-xl hover:scale-105 border-white/30 group"
            style="
              background:
                linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(14, 165, 233, 0.5)),
                rgba(0, 0, 0, 0.3);
            "
          >
            <span class="relative z-10">🚪 JOIN ROOM</span>
            <div
              class="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 group-hover:opacity-100"
            ></div>
          </button>
        </div>

        <!-- Secondary Buttons -->
        <div class="mb-6 animate-fade-in-delay">
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="showHowToPlay = true"
              class="px-4 py-3 text-sm font-bold text-white transition-all duration-300 transform rounded-lg glass-strong hover:bg-white/30 hover:scale-105"
            >
              📖 Rules
            </button>

            <button
              @click="showCredits = true"
              class="px-4 py-3 text-sm font-bold text-white transition-all duration-300 transform rounded-lg glass-strong hover:bg-white/30 hover:scale-105"
            >
              👥 Team
            </button>

            <button
              @click="goToSettings"
              class="px-4 py-3 text-sm font-bold text-white transition-all duration-300 transform rounded-lg glass-strong hover:bg-white/30 hover:scale-105"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        <!-- Mode Badge -->
        <div class="text-center animate-fade-in-delay-2">
          <div
            v-if="gameModeStore.isDemoMode()"
            class="inline-block px-4 py-2.5 rounded-lg glass border border-blue-400/60 bg-blue-500/30"
          >
            <p class="text-xs font-bold text-blue-100">🎮 DEMO MODE • No Backend Required</p>
          </div>
          <div
            v-else
            class="inline-block px-4 py-2.5 rounded-lg glass border border-green-400/60 bg-green-500/30"
          >
            <p class="text-xs font-bold text-green-100">🌐 API MODE • Connected to Backend</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Join Room Dialog -->
    <div
      v-if="showJoinDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showJoinDialog = false"
    >
      <div class="w-full max-w-md p-8 glass-card animate-slide-in">
        <h2 class="mb-6 text-2xl font-bold text-white">Join Room</h2>

        <div class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-white/80">Your Name</label>
            <input
              ref="nameInputJoin"
              v-model="playerName"
              type="text"
              placeholder="Enter your name"
              maxlength="20"
              @keydown.enter="handleJoinEnter"
              class="w-full px-4 py-3 text-white rounded-lg glass-light focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/40"
            />
          </div>

          <div>
            <label class="block mb-2 text-sm font-medium text-white/80">Room Code</label>
            <input
              v-model="roomCode"
              type="text"
              placeholder="Enter room code"
              maxlength="20"
              @keydown.enter="handleJoinEnter"
              class="w-full px-4 py-3 text-white uppercase rounded-lg glass-light focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/40"
            />
          </div>

          <p v-if="joinError" class="text-sm text-red-400">{{ joinError }}</p>

          <div class="flex gap-3 mt-6">
            <button
              @click="showJoinDialog = false"
              class="flex-1 px-6 py-3 font-semibold text-white transition-all rounded-lg glass-light hover:bg-white/15"
            >
              Cancel
            </button>
            <button
              @click="joinRoom"
              :disabled="!playerName.trim() || !roomCode.trim()"
              class="flex-1 px-6 py-3 font-semibold text-white transition-all rounded-lg glass-strong hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>

          <p class="mt-4 text-xs text-center text-white/50">
            💡 Press <kbd class="glass px-2 py-0.5 rounded text-white/70">Enter</kbd> to join
          </p>
        </div>
      </div>
    </div>

    <!-- How to Play Modal -->
    <div
      v-if="showHowToPlay"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showHowToPlay = false"
    >
      <div
        class="glass-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-in"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-white">📖 How to Play</h2>
          <button
            @click="showHowToPlay = false"
            class="w-10 h-10 font-bold text-white transition-all rounded-lg glass-light hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Game Rules -->
          <div class="space-y-4">
            <h3 class="flex items-center gap-2 mb-4 text-xl font-bold text-white">
              <span class="text-2xl">🎯</span>
              Game Rules
            </h3>

            <div class="flex items-start gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full glass-strong"
              >
                <span class="text-lg font-bold text-white">1</span>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-1.5 text-lg">Choose Your Cards</h4>
                <p class="text-sm leading-relaxed text-white/70">
                  Each player has cards numbered 1-9. Higher numbers are stronger! You start with 5
                  cards in hand and draw more as you play.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full glass-strong"
              >
                <span class="text-lg font-bold text-white">2</span>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-1.5 text-lg">Place on Board</h4>
                <p class="text-sm leading-relaxed text-white/70">
                  Take turns placing cards on the 4x4 grid strategically. Choose your position
                  wisely to set up winning combinations!
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full glass-strong"
              >
                <span class="text-lg font-bold text-white">3</span>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-1.5 text-lg">Form a Line to Win</h4>
                <p class="text-sm leading-relaxed text-white/70">
                  Get 4 of your cards in a row (horizontal, vertical, or diagonal) to win! Plan
                  ahead and block your opponents.
                </p>
              </div>
            </div>
          </div>

          <!-- Special Features -->
          <div class="space-y-4">
            <h3 class="flex items-center gap-2 mb-4 text-xl font-bold text-white">
              <span class="text-2xl">✨</span>
              Special Features
            </h3>

            <div class="flex items-start gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full glass"
              >
                <span class="text-2xl">🤖</span>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-1.5 text-lg">AI Opponents</h4>
                <p class="text-sm leading-relaxed text-white/70">
                  Play against smart bots with configurable difficulty levels. Adjust heuristic
                  weights to create custom AI behaviors!
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full glass"
              >
                <span class="text-2xl">🔄</span>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-1.5 text-lg">Card Replacement</h4>
                <p class="text-sm leading-relaxed text-white/70">
                  Replace opponent cards with higher value cards to capture their spots! Strategic
                  replacements can turn the game around.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full glass"
              >
                <span class="text-2xl">👥</span>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-1.5 text-lg">Multiplayer Rooms</h4>
                <p class="text-sm leading-relaxed text-white/70">
                  Create or join rooms to play with friends. Mix human players with AI bots for
                  flexible game modes (2-4 players total).
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pro Tips -->
        <div class="p-4 mt-8 border rounded-lg glass bg-yellow-500/10 border-yellow-500/30">
          <h3 class="flex items-center gap-2 mb-3 font-bold text-white">
            <span class="text-xl">💡</span>
            Pro Tips
          </h3>
          <ul class="space-y-2 text-sm text-white/80">
            <li class="flex items-start gap-2">
              <span class="text-yellow-400 mt-0.5">•</span>
              <span>Save your high-value cards (7, 8, 9) for critical moments</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-yellow-400 mt-0.5">•</span>
              <span>Always watch for opponent's potential winning lines and block them</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-yellow-400 mt-0.5">•</span>
              <span>Center positions are usually more valuable for creating multiple threats</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-yellow-400 mt-0.5">•</span>
              <span>Use replacement strategically to disrupt opponent's plans</span>
            </li>
          </ul>
        </div>

        <div class="mt-6 text-center">
          <button
            @click="showHowToPlay = false"
            class="px-8 py-3 font-bold text-white transition-all rounded-lg glass-strong hover:bg-white/30"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>

    <!-- Credits Modal -->
    <div
      v-if="showCredits"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showCredits = false"
    >
      <div class="w-full max-w-2xl p-8 glass-card animate-slide-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-white">👥 Development Team</h2>
          <button
            @click="showCredits = false"
            class="w-10 h-10 font-bold text-white transition-all rounded-lg glass-light hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        <div class="space-y-6">
          <!-- Frontend Team -->
          <div class="p-6 transition-all glass-light rounded-xl hover:bg-white/10">
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center flex-shrink-0 w-16 h-16 text-3xl rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
              >
                💻
              </div>
              <div class="flex-1">
                <h3 class="mb-1 text-xl font-bold text-white">Frontend Development</h3>
                <p class="text-lg text-white/90">Rama Dwiyantara Perkasa</p>
                <p class="mt-1 text-sm text-white/60">Vue 3 • TypeScript • Tailwind CSS • Pinia</p>
              </div>
            </div>
          </div>

          <!-- Backend Team -->
          <div class="p-6 transition-all glass-light rounded-xl hover:bg-white/10">
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center flex-shrink-0 w-16 h-16 text-3xl rounded-full bg-gradient-to-br from-green-500 to-teal-600"
              >
                ⚙️
              </div>
              <div class="flex-1">
                <h3 class="mb-1 text-xl font-bold text-white">Backend Development</h3>
                <p class="text-lg text-white/90">Steven Aldo Sutanto</p>
                <p class="mt-1 text-sm text-white/60">Golang • WebSocket • REST API • Game Logic</p>
              </div>
            </div>
          </div>

          <!-- Product Team -->
          <div class="p-6 transition-all glass-light rounded-xl hover:bg-white/10">
            <div class="flex items-center gap-4">
              <div
                class="flex items-center justify-center flex-shrink-0 w-16 h-16 text-3xl rounded-full bg-gradient-to-br from-orange-500 to-red-600"
              >
                🎯
              </div>
              <div class="flex-1">
                <h3 class="mb-1 text-xl font-bold text-white">Product Management</h3>
                <p class="text-lg text-white/90">Harrryanto Gani</p>
                <p class="mt-1 text-sm text-white/60">
                  Game Design • AI Heuristics • Feature Planning
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Info -->
        <div
          class="p-4 mt-8 text-center border rounded-lg glass bg-purple-500/10 border-purple-500/30"
        >
          <p class="mb-2 text-sm text-white/80">
            <strong class="text-white">Javanese Chess</strong> - A Strategic Card Placement Game
          </p>
          <p class="text-xs text-white/60">
            Inspired by traditional games, built with modern technology
          </p>
        </div>

        <div class="mt-6 text-center">
          <button
            @click="showCredits = false"
            class="px-8 py-3 font-bold text-white transition-all rounded-lg glass-strong hover:bg-white/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <CreateRoomModal
      :show="showCreateDialog"
      @close="showCreateDialog = false"
      @create="handleCreateRoom"
    />

    <!-- Error Modal -->
    <ErrorModal
      :show="!!creatingError"
      :message="creatingError"
      is-error
      @close="creatingError = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import CreateRoomModal from '@/components/CreateRoomModal.vue'
import ErrorModal from '@/components/ErrorModal.vue'
import { generatePlayerId, generateRoomCode } from '@/utils/id'
import type { HeuristicWeights } from '@/types/game'
import { useGameModeStore } from '@/stores/gameMode'

const router = useRouter()
const gameModeStore = useGameModeStore()

const showJoinDialog = ref(false)
const showCreateDialog = ref(false)
const showHowToPlay = ref(false)
const showCredits = ref(false)
const playerName = ref('')
const roomCode = ref('')
const joinError = ref('')
const nameInputJoin = ref<HTMLInputElement>()
const isCreatingRoom = ref(false)
const creatingError = ref('')
const isJoiningRoom = ref(false)

// Focus input when join dialog opens
watch(showJoinDialog, (newVal) => {
  if (newVal) {
    playerName.value = ''
    roomCode.value = ''
    joinError.value = ''
    nextTick(() => {
      nameInputJoin.value?.focus()
    })
  }
})

onMounted(() => {
  // Connect to socket on mount - DISABLED FOR NOW
  // socketService.connect()
})

function createRoom() {
  showCreateDialog.value = true
}

async function handleCreateRoom(config: {
  playerName: string
  humanPlayers: number
  bots: number
  heuristicWeights: HeuristicWeights
}) {
  isCreatingRoom.value = true
  creatingError.value = ''

  try {
    const playerId = generatePlayerId()
    const generatedRoomCode = generateRoomCode()

    // Save to localStorage for both modes
    localStorage.setItem('playerName', config.playerName)
    localStorage.setItem('playerId', playerId)
    localStorage.setItem('roomCode', generatedRoomCode)
    localStorage.setItem('isRoomMaster', 'true')
    localStorage.setItem(
      'roomConfig',
      JSON.stringify({
        humanPlayers: config.humanPlayers,
        bots: config.bots,
        heuristicWeights: config.heuristicWeights,
      }),
    )

    if (gameModeStore.isApiMode()) {
      // ✅ API MODE: Save mode and navigate to waiting room
      // API call will be made when "Start Game" is clicked in waiting room
      console.log('Creating room in API mode - will initialize on start')
      localStorage.setItem('gameMode', 'api')
    } else {
      // ✅ DEMO MODE: Same as before
      console.log('Creating room in demo mode')
      localStorage.setItem('gameMode', 'demo')
    }

    // Close modal and navigate to waiting room
    showCreateDialog.value = false
    router.push(`/room/${generatedRoomCode}`)
  } catch (error) {
    console.error('Failed to create room:', error)
    creatingError.value =
      error instanceof Error
        ? error.message
        : 'Failed to create room. Please check your connection and try again.'
  } finally {
    isCreatingRoom.value = false
  }
}

function handleJoinEnter() {
  if (playerName.value.trim() && roomCode.value.trim()) {
    joinRoom()
  }
}

async function joinRoom() {
  const name = playerName.value.trim()
  const code = roomCode.value.trim()

  if (!name) {
    joinError.value = 'Please enter your name'
    return
  }

  if (name.length < 2) {
    joinError.value = 'Name must be at least 2 characters'
    return
  }

  if (!code) {
    joinError.value = 'Please enter room code'
    return
  }

  if (gameModeStore.isApiMode()) {
    // API MODE: Just save to localStorage and navigate
    // RoomView.vue will handle the actual API call and WebSocket connection
    isJoiningRoom.value = true
    joinError.value = ''

    try {
      // Save player info to localStorage
      localStorage.setItem('playerName', name)
      localStorage.setItem('roomCode', code.toUpperCase())
      localStorage.setItem('isRoomMaster', 'false')
      localStorage.setItem('gameMode', 'api')

      // Close modal and navigate to waiting room
      // RoomView will call apiGameStore.joinLobby() which handles API + WebSocket
      showJoinDialog.value = false
      router.push(`/room/${code.toUpperCase()}`)
    } catch (error) {
      console.error('Failed to navigate to room:', error)
      joinError.value = 'Failed to join room. Please try again.'
    } finally {
      isJoiningRoom.value = false
    }
  } else {
    // DEMO MODE: Just navigate (old behavior)
    const playerId = generatePlayerId()

    localStorage.setItem('playerName', name)
    localStorage.setItem('playerId', playerId)
    localStorage.setItem('roomCode', code.toUpperCase())
    localStorage.setItem('isRoomMaster', 'false')
    localStorage.setItem('gameMode', 'demo')

    showJoinDialog.value = false
    router.push(`/room/${code.toUpperCase()}`)
  }
}

function goToSettings() {
  router.push('/settings')
}
</script>
