<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-card p-8 max-w-4xl w-full">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Game Lobby</h1>
        <button
          @click="goBack"
          class="glass-light hover:bg-white/15 text-white px-4 py-2 rounded-lg"
        >
          Leave
        </button>
      </div>

      <!-- Room Code -->
      <div class="glass-strong rounded-lg p-6 mb-6">
        <div class="text-center">
          <p class="text-white/60 text-sm mb-2">Room Code</p>
          <p class="text-4xl font-mono font-bold text-white tracking-wider">
            {{ code }}
          </p>
        </div>
      </div>

      <!-- Players List -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-white mb-4">Players ({{ players.length }}/4)</h2>
        <div class="space-y-3">
          <div
            v-for="player in players"
            :key="player.id"
            class="glass-light rounded-lg p-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full" :class="`bg-player-${player.color}`"></div>
              <span class="text-white font-medium">{{ player.name }}</span>
              <span v-if="player.isBot" class="text-xs glass px-2 py-1 rounded"> BOT </span>
            </div>
            <div class="text-white/60 text-sm">Ready</div>
          </div>

          <!-- Empty slots -->
          <div
            v-for="i in emptySlots"
            :key="`empty-${i}`"
            class="glass-light rounded-lg p-4 flex items-center gap-3 opacity-50"
          >
            <div class="w-4 h-4 rounded-full bg-white/20"></div>
            <span class="text-white/60">Waiting for player...</span>
          </div>
        </div>
      </div>

      <!-- Start Game Button -->
      <button
        @click="startGame"
        :disabled="players.length < 2"
        class="w-full glass-strong hover:bg-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { socketService } from '@/services/socket.service'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

const code = ref((route.query.code as string) || '')
const players = computed(() => gameStore.players)
const emptySlots = computed(() => Math.max(0, 4 - players.value.length))

onMounted(() => {
  if (!code.value) {
    router.push('/')
  }
})

function startGame() {
  if (players.value.length < 2) return

  socketService.startGame(code.value)
  router.push(`/room/${code.value}`)
}

function goBack() {
  socketService.leaveRoom(code.value)
  router.push('/')
}
</script>
