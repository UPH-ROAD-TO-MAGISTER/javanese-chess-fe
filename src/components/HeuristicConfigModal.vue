<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div
      class="glass-card p-6 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-in"
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

        <!-- Basic Move -->
        <div class="glass-light rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">✅ Legal Move Available</label>
            <span class="text-white font-mono text-lg">{{ localWeights.legalMove }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.legalMove"
            min="0"
            max="100"
            step="5"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">Base value for any legal move</p>
        </div>

        <!-- Win Move -->
        <div class="glass-light rounded-lg p-4 border border-yellow-500/30">
          <div class="flex justify-between items-center mb-2">
            <label class="text-white font-semibold">🏆 Winning Move (4 Aligned)</label>
            <span class="text-white font-mono text-lg">{{ localWeights.win }}</span>
          </div>
          <input
            type="range"
            v-model.number="localWeights.win"
            min="0"
            max="20000"
            step="500"
            class="w-full"
          />
          <p class="text-white/60 text-xs mt-1">Highest priority - complete 4-in-a-row</p>
        </div>

        <!-- Threat Detection Section -->
        <div class="glass-strong rounded-lg p-4">
          <h3 class="text-white font-bold mb-3 flex items-center gap-2">
            <span>🚨</span> Threat Detection (3 Opponent Cards Aligned)
          </h3>

          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Detect Threat (3 aligned)</label>
                <span class="text-white font-mono">{{ localWeights.detectThreat3 }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.detectThreat3"
                min="0"
                max="500"
                step="10"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Overwrite Opponent Card</label>
                <span class="text-white font-mono">{{ localWeights.overwriteThreat }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.overwriteThreat"
                min="0"
                max="500"
                step="10"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Block Threat (Middle)</label>
                <span class="text-white font-mono">{{ localWeights.blockThreatMiddle }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.blockThreatMiddle"
                min="0"
                max="200"
                step="5"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Block Threat (Edge)</label>
                <span class="text-white font-mono">{{ localWeights.blockThreatEdge }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.blockThreatEdge"
                min="0"
                max="200"
                step="5"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Block Opponent Path</label>
                <span class="text-white font-mono">{{ localWeights.blockOpponentPath }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.blockOpponentPath"
                min="0"
                max="200"
                step="5"
                class="w-full"
              />
            </div>

            <!-- Threat Card Values 1-9 -->
            <div class="border-t border-white/10 pt-3 mt-3">
              <p class="text-white/70 text-xs mb-2">Card Values for Threat (1-9):</p>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="i in 9" :key="`threat-${i}`">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-white text-xs">Card {{ i }}</label>
                    <span class="text-white/70 text-xs font-mono">{{ localWeights[`threatCardValue${i}` as keyof typeof localWeights] }}</span>
                  </div>
                  <input
                    type="range"
                    v-model.number="localWeights[`threatCardValue${i}` as keyof typeof localWeights]"
                    min="0"
                    max="200"
                    step="5"
                    class="w-full h-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Potential Threat Section -->
        <div class="glass-strong rounded-lg p-4">
          <h3 class="text-white font-bold mb-3 flex items-center gap-2">
            <span>⚠️</span> Potential Threat (Adjacent Cards)
          </h3>

          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Detect Potential Threat</label>
                <span class="text-white font-mono">{{ localWeights.detectPotentialThreat }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.detectPotentialThreat"
                min="0"
                max="300"
                step="10"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Overwrite Potential Threat</label>
                <span class="text-white font-mono">{{ localWeights.overwritePotentialThreat }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.overwritePotentialThreat"
                min="0"
                max="300"
                step="10"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Block Potential Path</label>
                <span class="text-white font-mono">{{ localWeights.blockPotentialPath }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.blockPotentialPath"
                min="0"
                max="200"
                step="5"
                class="w-full"
              />
            </div>

            <!-- Potential Threat Card Values 1-9 -->
            <div class="border-t border-white/10 pt-3 mt-3">
              <p class="text-white/70 text-xs mb-2">Card Values for Potential Threat (1-9):</p>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="i in 9" :key="`potential-${i}`">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-white text-xs">Card {{ i }}</label>
                    <span class="text-white/70 text-xs font-mono">{{ localWeights[`potentialThreatCardValue${i}` as keyof typeof localWeights] }}</span>
                  </div>
                  <input
                    type="range"
                    v-model.number="localWeights[`potentialThreatCardValue${i}` as keyof typeof localWeights]"
                    min="0"
                    max="200"
                    step="5"
                    class="w-full h-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Own Strategy Section -->
        <div class="glass-strong rounded-lg p-4">
          <h3 class="text-white font-bold mb-3 flex items-center gap-2">
            <span>🎯</span> Own Strategy
          </h3>

          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Create 2-in-a-Row</label>
                <span class="text-white font-mono">{{ localWeights.create2InRow }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.create2InRow"
                min="0"
                max="200"
                step="5"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Create 3-in-a-Row</label>
                <span class="text-white font-mono">{{ localWeights.create3InRow }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.create3InRow"
                min="0"
                max="300"
                step="10"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Card Strategy Section -->
        <div class="glass-strong rounded-lg p-4">
          <h3 class="text-white font-bold mb-3 flex items-center gap-2">
            <span>🃏</span> Card Strategy
          </h3>

          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Play Smallest Card First</label>
                <span class="text-white font-mono">{{ localWeights.playSmallestCard }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.playSmallestCard"
                min="0"
                max="200"
                step="5"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-white text-sm">Place Near Own Card</label>
                <span class="text-white font-mono">{{ localWeights.placeNearOwnCard }}</span>
              </div>
              <input
                type="range"
                v-model.number="localWeights.placeNearOwnCard"
                min="0"
                max="200"
                step="5"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6 pt-6 border-t border-white/10">
        <button
          @click="resetToDefault"
          class="flex-1 glass hover:glass-strong text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          Reset to Default
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
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom range slider styling */
input[type='range'] {
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  height: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: 0;
}
</style>
