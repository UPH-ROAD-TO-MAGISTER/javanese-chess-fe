<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div
          class="relative glass-strong rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-in"
        >
          <!-- Title -->
          <div class="text-center mb-6">
            <h2 class="text-3xl font-black text-white mb-2">🎲 Game Ready!</h2>
            <p class="text-white/70 text-base">Shuffle untuk menentukan siapa yang main duluan</p>
          </div>

          <!-- Player Preview -->
          <div v-if="!isShuffling && !selectedPlayer" class="mb-6">
            <div class="glass-light rounded-xl p-4">
              <h3 class="text-sm font-semibold text-white/80 mb-3 text-center">Players</h3>
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="player in players"
                  :key="player.id"
                  class="glass rounded-lg p-2 flex items-center gap-2"
                >
                  <div
                    class="w-4 h-4 rounded-full flex-shrink-0"
                    :class="`bg-player-${player.color}`"
                  ></div>
                  <span class="text-white text-sm font-medium truncate">
                    {{ player.name }}
                  </span>
                  <span
                    v-if="player.isBot"
                    class="text-[10px] glass px-1.5 py-0.5 rounded text-white/60 ml-auto"
                  >
                    BOT
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shuffling Animation -->
          <div v-if="isShuffling" class="mb-6">
            <div class="glass-light rounded-xl p-8 text-center">
              <div class="text-6xl mb-4 animate-spin">🎲</div>
              <p class="text-white text-lg font-semibold animate-pulse">Shuffling...</p>
            </div>
          </div>

          <!-- Selected Player Result -->
          <div v-if="selectedPlayer && !isShuffling" class="mb-6">
            <div class="glass-light rounded-xl p-6 text-center animate-bounce-once">
              <div class="text-5xl mb-4">🎉</div>
              <p class="text-white/70 text-sm mb-2">First turn goes to:</p>
              <div class="flex items-center justify-center gap-3 mb-3">
                <div
                  class="w-6 h-6 rounded-full"
                  :class="`bg-player-${selectedPlayer.color}`"
                ></div>
                <h3 class="text-2xl font-black text-white">{{ selectedPlayer.name }}</h3>
              </div>
              <span
                v-if="selectedPlayer.isBot"
                class="inline-block text-xs glass px-3 py-1 rounded-full text-white/70"
              >
                BOT will play automatically
              </span>
              <span
                v-else
                class="inline-block text-xs glass px-3 py-1 rounded-full text-green-400"
              >
                Your turn!
              </span>
            </div>
          </div>

          <!-- Action Button -->
          <button
            v-if="!isShuffling && !selectedPlayer"
            @click="handleShuffle"
            class="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            🎲 Shuffle First Turn
          </button>

          <button
            v-if="selectedPlayer && !isShuffling"
            @click="handleStart"
            class="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            🚀 Start Game
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Player } from '@/types/game'

interface Props {
  show: boolean
  players: Player[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  start: [firstPlayer: Player]
}>()

const isShuffling = ref(false)
const selectedPlayer = ref<Player | null>(null)

async function handleShuffle() {
  isShuffling.value = true

  // Simulate shuffling animation
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Randomly select a player
  const randomIndex = Math.floor(Math.random() * props.players.length)
  selectedPlayer.value = props.players[randomIndex]

  isShuffling.value = false
}

function handleStart() {
  if (selectedPlayer.value) {
    emit('start', selectedPlayer.value)
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.animate-slide-in {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-bounce-once {
  animation: bounceOnce 0.6s ease-out;
}

@keyframes bounceOnce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
