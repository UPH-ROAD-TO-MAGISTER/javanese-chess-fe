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

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="text-white/70 text-sm">Loading configuration...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="glass rounded-lg p-4 mb-4 border border-red-500/30">
          <div class="text-red-400 text-sm">{{ loadError }}</div>
          <div class="text-white/60 text-xs mt-1">Showing fallback configuration</div>
        </div>

        <div v-else class="space-y-3">
          <!-- Legal Move -->
          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">✅ Legal Move Available</div>
              <div class="text-white/60 text-xs mt-0.5">Base value for legal moves</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.legalMove }}
            </div>
          </div>

          <!-- Win Move -->
          <div
            class="flex items-center justify-between p-3 glass rounded-lg border border-yellow-500/30"
          >
            <div>
              <div class="text-white font-medium text-sm">🏆 Winning Move (4 Aligned)</div>
              <div class="text-white/60 text-xs mt-0.5">Highest priority - complete 4-in-a-row</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.win }}
            </div>
          </div>

          <!-- Threat Detection Section -->
          <div class="mt-4 mb-2">
            <h4 class="text-white font-semibold text-sm flex items-center gap-2">
              <span>🚨</span> Threat Detection (3 Aligned)
            </h4>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Detect Threat (3 aligned)</div>
              <div class="text-white/60 text-xs mt-0.5">Recognize immediate threats</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.detectThreat3 }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Threat Card Values</div>
              <div class="text-white/60 text-xs mt-0.5">
                Cards 1-9: {{ displayWeights.threatCardValue1 }} to
                {{ displayWeights.threatCardValue9 }}
              </div>
            </div>
            <div class="text-white font-mono font-bold text-xs">
              1:{{ displayWeights.threatCardValue1 }} ... 9:{{ displayWeights.threatCardValue9 }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Overwrite Opponent Card</div>
              <div class="text-white/60 text-xs mt-0.5">Replace to block threat</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.overwriteThreat }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Block Middle Formation</div>
              <div class="text-white/60 text-xs mt-0.5">Priority for middle positions</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.blockThreatMiddle }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Block Edge Formation</div>
              <div class="text-white/60 text-xs mt-0.5">Priority for edge positions</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.blockThreatEdge }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Block Opponent's Path</div>
              <div class="text-white/60 text-xs mt-0.5">Prevent threat completion</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.blockOpponentPath }}
            </div>
          </div>

          <!-- Potential Threat Section -->
          <div class="mt-4 mb-2">
            <h4 class="text-white font-semibold text-sm flex items-center gap-2">
              <span>⚠️</span> Potential Threat (Adjacent but &lt; 3)
            </h4>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Detect Potential Threat</div>
              <div class="text-white/60 text-xs mt-0.5">Cards adjacent but not 3 yet</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.detectPotentialThreat }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Potential Card Values</div>
              <div class="text-white/60 text-xs mt-0.5">
                Cards 1-9: {{ displayWeights.potentialThreatCardValue1 }} to
                {{ displayWeights.potentialThreatCardValue9 }} (inverted)
              </div>
            </div>
            <div class="text-white font-mono font-bold text-xs">
              1:{{ displayWeights.potentialThreatCardValue1 }} ... 9:{{
                displayWeights.potentialThreatCardValue9
              }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Overwrite Opponent Card</div>
              <div class="text-white/60 text-xs mt-0.5">Replace potential threat</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.overwritePotentialThreat }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Block Opponent's Path</div>
              <div class="text-white/60 text-xs mt-0.5">Prevent potential threat growth</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.blockPotentialPath }}
            </div>
          </div>

          <!-- Own Strategy Section -->
          <div class="mt-4 mb-2">
            <h4 class="text-white font-semibold text-sm flex items-center gap-2">
              <span>🎯</span> Own Strategy
            </h4>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">2 Cards Aligned</div>
              <div class="text-white/60 text-xs mt-0.5">Early positioning strategy</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.create2InRow }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">3 Cards Aligned</div>
              <div class="text-white/60 text-xs mt-0.5">Setup for win next turn</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.create3InRow }}
            </div>
          </div>

          <!-- Card Strategy Section -->
          <div class="mt-4 mb-2">
            <h4 class="text-white font-semibold text-sm flex items-center gap-2">
              <span>🃏</span> Card Strategy
            </h4>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Play Smallest Card</div>
              <div class="text-white/60 text-xs mt-0.5">Conserve high-value cards</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.playSmallestCard }}
            </div>
          </div>

          <div class="flex items-center justify-between p-3 glass rounded-lg">
            <div>
              <div class="text-white font-medium text-sm">Place Near Own Card</div>
              <div class="text-white/60 text-xs mt-0.5">Build connectivity</div>
            </div>
            <div class="text-white font-mono font-bold text-lg">
              {{ displayWeights.placeNearOwnCard }}
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
import { ref, watch } from 'vue'
import type { HeuristicWeights } from '@/types/game'
import { useGameModeStore } from '@/stores/gameMode'
import { apiService } from '@/services/api'

interface Props {
  show: boolean
  roomCode: string
  players: Array<{ id: string; name: string; isBot: boolean }> // Accept any player type
  heuristicWeights: HeuristicWeights
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const gameModeStore = useGameModeStore()
const displayWeights = ref<HeuristicWeights>(props.heuristicWeights)
const isLoading = ref(false)
const loadError = ref('')

// Watch for modal opening and fetch weights if in API mode
watch(
  () => props.show,
  async (isShown) => {
    if (isShown && gameModeStore.isApiMode()) {
      // Fetch weights from API
      isLoading.value = true
      loadError.value = ''

      try {
        const weights = await apiService.getRoomWeights(props.roomCode)
        displayWeights.value = weights
        console.log('Loaded room weights from API:', weights)
      } catch (error) {
        console.error('Failed to load room weights:', error)
        loadError.value = 'Failed to load room configuration from server'
        // Fallback to passed weights
        displayWeights.value = props.heuristicWeights
      } finally {
        isLoading.value = false
      }
    } else {
      // Demo mode - use passed weights
      displayWeights.value = props.heuristicWeights
    }
  },
)

function closeModal() {
  emit('close')
}
</script>
