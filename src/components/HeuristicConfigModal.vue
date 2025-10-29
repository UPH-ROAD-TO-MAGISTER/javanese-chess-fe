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
          <span>⚙️</span>
          Bot AI Heuristic Configuration
        </h2>
        <button
          @click="closeModal"
          class="text-white/60 hover:text-white text-2xl leading-none transition-colors"
        >
          ×
        </button>
      </div>

      <div class="space-y-4">
        <p class="text-white/80 text-sm mb-6">
          Configure the weights for bot AI decision making. Higher values mean higher priority.
        </p>

        <!-- Win Move -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">🏆 Win Move (4-in-a-row)</label>
            <span class="text-white font-mono text-lg">{{ localWeights.win }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.win"
            min="0"
            max="20000"
            step="100"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">
            Priority for moves that create 4-in-a-row (winning move)
          </p>
        </div>

        <!-- Block Opponent 3-in-a-row -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">🛡️ Block Opponent 3-in-a-row</label>
            <span class="text-white font-mono text-lg">{{ localWeights.blockOpponent3 }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.blockOpponent3"
            min="0"
            max="10000"
            step="100"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">
            Priority for blocking opponent's potential winning move
          </p>
        </div>

        <!-- Create 3-in-a-row -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">🎯 Create 3-in-a-row</label>
            <span class="text-white font-mono text-lg">{{ localWeights.create3InRow }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.create3InRow"
            min="0"
            max="5000"
            step="50"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">Setup for potential win in next turn</p>
        </div>

        <!-- Create 2-in-a-row -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">📍 Create 2-in-a-row</label>
            <span class="text-white font-mono text-lg">{{ localWeights.create2InRow }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.create2InRow"
            min="0"
            max="1000"
            step="10"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">Early game positioning strategy</p>
        </div>

        <!-- Card Value -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">💎 Card Value</label>
            <span class="text-white font-mono text-lg">{{ localWeights.cardValue }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.cardValue"
            min="0"
            max="100"
            step="1"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">
            Bonus for playing higher value cards (1-9)
          </p>
        </div>

        <!-- Center Control -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">🎲 Center Control</label>
            <span class="text-white font-mono text-lg">{{ localWeights.centerControl }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.centerControl"
            min="0"
            max="50"
            step="1"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">
            Strategic value for controlling center positions
          </p>
        </div>

        <!-- Replacement -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">⚔️ Card Replacement</label>
            <span class="text-white font-mono text-lg">{{ localWeights.replacement }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.replacement"
            min="0"
            max="500"
            step="10"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">
            Bonus for replacing opponent's cards with higher value
          </p>
        </div>

        <!-- Preset Buttons -->
        <div class="flex gap-2 mt-6">
          <button
            @click="applyPreset('easy')"
            class="flex-1 glass-light hover:bg-white/15 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Easy
          </button>
          <button
            @click="applyPreset('medium')"
            class="flex-1 glass-light hover:bg-white/15 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Medium
          </button>
          <button
            @click="applyPreset('hard')"
            class="flex-1 glass-light hover:bg-white/15 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Hard
          </button>
          <button
            @click="resetToDefault"
            class="flex-1 glass-light hover:bg-white/15 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 mt-8">
        <button
          @click="closeModal"
          class="flex-1 glass-light hover:bg-white/15 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          @click="saveConfig"
          class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
        >
          Apply Configuration
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { HeuristicWeights } from '@/types/game'

interface Props {
  show: boolean
  weights: HeuristicWeights
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [weights: HeuristicWeights]
}>()

const localWeights = ref<HeuristicWeights>({ ...props.weights })

// Watch for external changes
watch(
  () => props.weights,
  (newWeights) => {
    localWeights.value = { ...newWeights }
  },
  { deep: true }
)

const defaultWeights: HeuristicWeights = {
  win: 10000,
  blockOpponent3: 5000,
  create3InRow: 1000,
  create2InRow: 100,
  cardValue: 10,
  centerControl: 5,
  replacement: 50,
}

function closeModal() {
  emit('close')
}

function saveConfig() {
  emit('save', { ...localWeights.value })
  emit('close')
}

function resetToDefault() {
  localWeights.value = { ...defaultWeights }
}

function applyPreset(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      localWeights.value = {
        win: 5000,
        blockOpponent3: 1000,
        create3InRow: 200,
        create2InRow: 50,
        cardValue: 20,
        centerControl: 10,
        replacement: 30,
      }
      break
    case 'medium':
      localWeights.value = { ...defaultWeights }
      break
    case 'hard':
      localWeights.value = {
        win: 15000,
        blockOpponent3: 8000,
        create3InRow: 2000,
        create2InRow: 300,
        cardValue: 5,
        centerControl: 3,
        replacement: 100,
      }
      break
  }
}
</script>

<style scoped>
/* Range input styling */
input[type='range'] {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
}

input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

input[type='range']::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
}
</style>
