<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-card p-8 md:p-12 max-w-2xl w-full">
      <div class="text-center mb-8">
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-4">Javanese Chess</h1>
        <p class="text-white/80 text-lg">Strategic card placement game for 2-4 players</p>
      </div>

      <div class="space-y-4">
        <button
          @click="createRoom"
          class="w-full glass-strong hover:bg-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          Create Room (Demo)
        </button>

        <button
          @click="showJoinDialog = true"
          class="w-full glass hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          Join Room (Demo)
        </button>

        <button
          @click="goToSettings"
          class="w-full glass-light hover:bg-white/15 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
        >
          Settings
        </button>
      </div>

      <!-- Demo Mode Notice -->
      <div class="mt-6 glass bg-blue-500/20 border-blue-500/50 rounded-lg p-3 text-center">
        <p class="text-blue-200 text-sm">🎮 Demo Mode - No backend required</p>
      </div>
    </div>

    <!-- Join Room Dialog -->
    <div
      v-if="showJoinDialog"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showJoinDialog = false"
    >
      <div class="glass-card p-8 max-w-md w-full animate-slide-in">
        <h2 class="text-2xl font-bold text-white mb-6">Join Room</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-white/80 mb-2 text-sm">Your Name</label>
            <input
              v-model="playerName"
              type="text"
              placeholder="Enter your name"
              class="w-full glass-light text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label class="block text-white/80 mb-2 text-sm">Room Code</label>
            <input
              v-model="roomCode"
              type="text"
              placeholder="Enter room code"
              class="w-full glass-light text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 uppercase"
            />
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="showJoinDialog = false"
              class="flex-1 glass-light hover:bg-white/15 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              @click="joinRoom"
              :disabled="!playerName || !roomCode"
              class="flex-1 glass-strong hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showJoinDialog = ref(false)
const playerName = ref('')
const roomCode = ref('')

onMounted(() => {
  // Connect to socket on mount - DISABLED FOR NOW
  // socketService.connect()
})

function createRoom() {
  const name = prompt('Enter your name:')
  if (!name) return

  // Demo mode: directly go to game room without backend
  router.push('/room/DEMO-ROOM')
}

function joinRoom() {
  if (!playerName.value || !roomCode.value) return

  // Demo mode: directly go to game room
  router.push(`/room/${roomCode.value.toUpperCase()}`)
  showJoinDialog.value = false
}

function goToSettings() {
  router.push('/settings')
}
</script>
