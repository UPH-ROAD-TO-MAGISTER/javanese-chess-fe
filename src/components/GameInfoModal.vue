<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div
      class="glass-card p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in"
      @click.stop
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <span>ℹ️</span>
          Game Information
        </h2>
        <button
          @click="closeModal"
          class="text-white/60 hover:text-white text-2xl leading-none transition-colors"
        >
          ×
        </button>
      </div>

      <!-- Room Info -->
      <div class="glass-light rounded-lg p-4 mb-6">
        <h3 class="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🏠</span>
          Room Information
        </h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-white/70">Room Code:</span>
            <span class="text-white font-mono font-bold">{{ roomCode }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/70">Total Players:</span>
            <span class="text-white font-semibold">{{ players.length }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/70">Human Players:</span>
            <span class="text-white font-semibold">
              {{ players.filter((p) => !p.isBot).length }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/70">Bots:</span>
            <span class="text-white font-semibold">
              {{ players.filter((p) => p.isBot).length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bot AI Configuration -->
      <div class="glass-light rounded-lg p-4">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <span>🤖</span>
          Bot AI Heuristic Configuration
        </h3>

        <div class="space-y-3">
          <!-- Win Move -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">🏆 Win Move (4-in-a-row)</div>
              <div class="text-white/60 text-xs mt-0.5">Priority for winning moves</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ heuristicWeights.win }}
            </div>
          </div>

          <!-- Block Opponent 3 -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">🛡️ Block Opponent 3-in-a-row</div>
              <div class="text-white/60 text-xs mt-0.5">Defensive strategy</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ heuristicWeights.blockOpponent3 }}
            </div>
          </div>

          <!-- Create 3-in-a-row -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">🎯 Create 3-in-a-row</div>
              <div class="text-white/60 text-xs mt-0.5">Setup for win</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ heuristicWeights.create3InRow }}
            </div>
          </div>

          <!-- Create 2-in-a-row -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">📍 Create 2-in-a-row</div>
              <div class="text-white/60 text-xs mt-0.5">Early positioning</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ heuristicWeights.create2InRow }}
            </div>
          </div>

          <!-- Card Value -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">💎 Card Value</div>
              <div class="text-white/60 text-xs mt-0.5">Higher card bonus</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ heuristicWeights.cardValue }}
            </div>
          </div>

          <!-- Center Control -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">🎲 Center Control</div>
              <div class="text-white/60 text-xs mt-0.5">Strategic positioning</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ heuristicWeights.centerControl }}
            </div>
          </div>

          <!-- Replacement -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">⚔️ Card Replacement</div>
              <div class="text-white/60 text-xs mt-0.5">Capture opponent cards</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ heuristicWeights.replacement }}
            </div>
          </div>
        </div>

        <p class="text-white/50 text-xs mt-4 text-center">
          These weights determine how the bot AI evaluates and prioritizes moves
        </p>
      </div>

      <!-- Close Button -->
      <button
        @click="closeModal"
        class="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeuristicWeights, Player } from '@/types/game'

interface Props {
  show: boolean
  roomCode: string
  players: Player[]
  heuristicWeights: HeuristicWeights
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

function closeModal() {
  emit('close')
}
</script>
