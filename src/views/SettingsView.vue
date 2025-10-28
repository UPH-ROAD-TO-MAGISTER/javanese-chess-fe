<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-card p-8 max-w-4xl w-full">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Settings</h1>
        <button
          @click="goBack"
          class="glass-light hover:bg-white/15 text-white px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      <div class="space-y-8">
        <!-- Visual Settings -->
        <div class="glass-light rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">Visual Settings</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-white font-medium">Show Valid Moves</p>
                <p class="text-white/60 text-sm">Highlight valid squares when selecting a card</p>
              </div>
              <button
                @click="toggleSetting('showValidMoves')"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settingsStore.visual.showValidMoves ? 'bg-green-500' : 'bg-white/20'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.visual.showValidMoves ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <div class="flex justify-between items-center">
              <div>
                <p class="text-white font-medium">Show Card Preview</p>
                <p class="text-white/60 text-sm">Preview card placement before confirming</p>
              </div>
              <button
                @click="toggleSetting('showCardPreview')"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settingsStore.visual.showCardPreview ? 'bg-green-500' : 'bg-white/20'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.visual.showCardPreview ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <div class="flex justify-between items-center">
              <div>
                <p class="text-white font-medium">Enable Animations</p>
                <p class="text-white/60 text-sm">Smooth animations for card movements</p>
              </div>
              <button
                @click="toggleSetting('enableAnimations')"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settingsStore.visual.enableAnimations ? 'bg-green-500' : 'bg-white/20'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settingsStore.visual.enableAnimations ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Heuristic Settings -->
        <div class="glass-light rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">Bot Heuristic Configuration</h2>
          <p class="text-white/60 text-sm mb-6">
            These values are sent to the backend to configure bot behavior.
          </p>

          <div class="space-y-6">
            <!-- Basic Moves -->
            <div class="border-b border-white/10 pb-4">
              <h3 class="text-white font-semibold mb-4">Basic Moves</h3>
              <div>
                <div class="flex justify-between mb-2">
                  <label class="text-white font-medium text-sm">Legal Move Available</label>
                  <span class="text-white/80">{{
                    settingsStore.heuristic.legalMoveAvailable
                  }}</span>
                </div>
                <input
                  v-model.number="settingsStore.heuristic.legalMoveAvailable"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full"
                  @change="saveHeuristic"
                />
                <p class="text-white/60 text-xs mt-1">Base value for any legal move</p>
              </div>
            </div>

            <!-- Winning Condition -->
            <div class="border-b border-white/10 pb-4">
              <h3 class="text-white font-semibold mb-4">Winning Condition</h3>
              <div>
                <div class="flex justify-between mb-2">
                  <label class="text-white font-medium text-sm">Prioritize Winning Move</label>
                  <span class="text-white/80">{{
                    settingsStore.heuristic.prioritizeWinningMove
                  }}</span>
                </div>
                <input
                  v-model.number="settingsStore.heuristic.prioritizeWinningMove"
                  type="range"
                  min="5000"
                  max="15000"
                  step="100"
                  class="w-full"
                  @change="saveHeuristic"
                />
                <p class="text-white/60 text-xs mt-1">Weight for 4 aligned cards (winning move)</p>
              </div>
            </div>

            <!-- Threat Detection -->
            <div class="border-b border-white/10 pb-4">
              <h3 class="text-white font-semibold mb-4">Threat Detection (3 Aligned)</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">Detect Threat</label>
                    <span class="text-white/80">{{ settingsStore.heuristic.detectThreat }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.detectThreat"
                    type="range"
                    min="100"
                    max="300"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>

                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm"
                      >Overwrite Opponent (Threat)</label
                    >
                    <span class="text-white/80">{{
                      settingsStore.heuristic.overwriteOpponentCardThreat
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.overwriteOpponentCardThreat"
                    type="range"
                    min="100"
                    max="300"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>

                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">Block Middle of Threat</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.middleOfThreatFormation
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.middleOfThreatFormation"
                    type="range"
                    min="50"
                    max="150"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>

                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">Block Edge of Threat</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.edgeOfThreatFormation
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.edgeOfThreatFormation"
                    type="range"
                    min="25"
                    max="100"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>

                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">Block Path (Threat)</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.blockOpponentPathThreat
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.blockOpponentPathThreat"
                    type="range"
                    min="50"
                    max="150"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>
              </div>
            </div>

            <!-- Potential Threat -->
            <div class="border-b border-white/10 pb-4">
              <h3 class="text-white font-semibold mb-4">Potential Threat (&lt;3 Adjacent)</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm"
                      >Overwrite Opponent (Potential)</label
                    >
                    <span class="text-white/80">{{
                      settingsStore.heuristic.overwriteOpponentCardPotential
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.overwriteOpponentCardPotential"
                    type="range"
                    min="75"
                    max="200"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>

                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">Block Path (Potential)</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.blockOpponentPathPotential
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.blockOpponentPathPotential"
                    type="range"
                    min="40"
                    max="120"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>
              </div>
            </div>

            <!-- Own Card Alignment -->
            <div class="border-b border-white/10 pb-4">
              <h3 class="text-white font-semibold mb-4">Own Card Alignment</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">2 Cards Aligned</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.twoOwnCardsAligned
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.twoOwnCardsAligned"
                    type="range"
                    min="25"
                    max="100"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>

                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">3 Cards Aligned</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.threeOwnCardsAligned
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.threeOwnCardsAligned"
                    type="range"
                    min="50"
                    max="200"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>
              </div>
            </div>

            <!-- Strategic Moves -->
            <div>
              <h3 class="text-white font-semibold mb-4">Strategic Moves</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">Play Smallest Card</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.playSmallestCard
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.playSmallestCard"
                    type="range"
                    min="30"
                    max="100"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>

                <div>
                  <div class="flex justify-between mb-2">
                    <label class="text-white font-medium text-sm">Place Near Own Card</label>
                    <span class="text-white/80">{{
                      settingsStore.heuristic.placeNearOwnCard
                    }}</span>
                  </div>
                  <input
                    v-model.number="settingsStore.heuristic.placeNearOwnCard"
                    type="range"
                    min="30"
                    max="100"
                    class="w-full"
                    @change="saveHeuristic"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reset Button -->
        <button
          @click="resetSettings"
          class="w-full glass-light hover:bg-white/15 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import type { VisualSettings } from '@/types/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

function toggleSetting(key: keyof VisualSettings) {
  settingsStore.toggleVisualSetting(key)
}

function saveHeuristic() {
  settingsStore.saveSettings()
}

function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    settingsStore.resetToDefaults()
  }
}

function goBack() {
  router.push('/')
}
</script>

<style scoped>
input[type='range'] {
  @apply h-2 bg-white/20 rounded-lg appearance-none cursor-pointer;
}

input[type='range']::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-white rounded-full cursor-pointer;
}

input[type='range']::-moz-range-thumb {
  @apply w-4 h-4 bg-white rounded-full cursor-pointer border-0;
}
</style>
