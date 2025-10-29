<template>
  <Transition name="fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-md p-8 transform shadow-2xl glass-strong rounded-2xl animate-slide-in"
      >
        <!-- Confetti/Celebration Icon -->
        <div class="mb-6 text-center">
          <div class="mb-4 text-6xl animate-bounce">🎉</div>
          <h2 class="mb-2 text-3xl font-bold text-white">Victory!</h2>
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light"
            :class="`bg-player-${winner?.color}/20`"
          >
            <div class="w-6 h-6 rounded-full" :class="`bg-player-${winner?.color}`"></div>
            <span class="text-lg font-semibold text-white">{{ winner?.name }}</span>
          </div>
        </div>

        <!-- Win Type Info -->
        <div class="p-4 mb-6 rounded-lg glass-card">
          <div class="mb-2 text-sm text-center text-white/80">Win Condition</div>
          <div class="text-center">
            <span
              class="inline-flex items-center gap-2 text-lg font-semibold text-white capitalize"
            >
              <span v-if="winType === 'horizontal'">↔️ Horizontal</span>
              <span v-else-if="winType === 'vertical'">↕️ Vertical</span>
              <span v-else-if="winType === 'diagonal'">↗️ Diagonal</span>
              <span class="text-yellow-400">4 in a Row!</span>
            </span>
          </div>
        </div>

        <!-- Winning Cards Preview -->
        <div v-if="winningCards && winningCards.length > 0" class="mb-6">
          <div class="mb-3 text-xs text-center text-white/60">Winning Cards</div>
          <div class="flex justify-center gap-2">
            <div
              v-for="(pos, index) in winningCards"
              :key="index"
              class="p-2 border-2 rounded-lg glass-strong animate-card-place"
              :class="`border-player-${winner?.color}`"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="text-center">
                <div class="text-sm text-white/60">({{ pos.x }},{{ pos.y }})</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="emit('playAgain')"
            class="flex-1 px-6 py-3 font-semibold text-white transition-all transform rounded-lg glass-strong hover:bg-white/30 hover:scale-105"
          >
            Play Again
          </button>
          <button
            @click="emit('close')"
            class="flex-1 px-6 py-3 font-semibold text-white transition-all transform rounded-lg glass-light hover:bg-white/15 hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Player, Position } from '@/types/game'

interface Props {
  isVisible: boolean
  winner: Player | null
  winType?: 'horizontal' | 'vertical' | 'diagonal'
  winningCards?: Position[]
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  playAgain: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-slide-in {
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
  0% {
    transform: scale(0.7) translateY(-50px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes cardPlace {
  0% {
    transform: scale(0.8) rotate(-5deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-card-place {
  animation: cardPlace 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
</style>
