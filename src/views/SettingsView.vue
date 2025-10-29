<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-4xl p-8 glass-card">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-white">Settings</h1>
        <button
          @click="goBack"
          class="px-4 py-2 text-white rounded-lg glass-light hover:bg-white/15"
        >
          Back
        </button>
      </div>

      <div class="space-y-8">
        <!-- Visual Settings -->
        <div class="p-6 rounded-lg glass-light">
          <h2 class="mb-4 text-xl font-semibold text-white">Visual Settings</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-white">Show Valid Moves</p>
                <p class="text-sm text-white/60">Highlight valid squares when selecting a card</p>
              </div>
              <button
                @click="toggleSetting('showValidMoves')"
                class="relative inline-flex items-center h-6 transition-colors rounded-full w-11"
                :class="settingsStore.visual.showValidMoves ? 'bg-green-500' : 'bg-white/20'"
              >
                <span
                  class="inline-block w-4 h-4 transition-transform transform bg-white rounded-full"
                  :class="settingsStore.visual.showValidMoves ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-white">Show Card Preview</p>
                <p class="text-sm text-white/60">Preview card placement before confirming</p>
              </div>
              <button
                @click="toggleSetting('showCardPreview')"
                class="relative inline-flex items-center h-6 transition-colors rounded-full w-11"
                :class="settingsStore.visual.showCardPreview ? 'bg-green-500' : 'bg-white/20'"
              >
                <span
                  class="inline-block w-4 h-4 transition-transform transform bg-white rounded-full"
                  :class="settingsStore.visual.showCardPreview ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-white">Enable Animations</p>
                <p class="text-sm text-white/60">Smooth animations for card movements</p>
              </div>
              <button
                @click="toggleSetting('enableAnimations')"
                class="relative inline-flex items-center h-6 transition-colors rounded-full w-11"
                :class="settingsStore.visual.enableAnimations ? 'bg-green-500' : 'bg-white/20'"
              >
                <span
                  class="inline-block w-4 h-4 transition-transform transform bg-white rounded-full"
                  :class="settingsStore.visual.enableAnimations ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Reset Button -->
        <button
          @click="resetSettings"
          class="w-full px-6 py-3 font-semibold text-white transition-all rounded-lg glass-light hover:bg-white/15"
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
