<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    @click.self="closeModal"
  >
    <div class="glass-card p-8 max-w-lg w-full animate-slide-in">
      <h2 class="text-2xl font-bold text-white mb-6 flex items-center justify-between">
        <span>Create Room</span>
        <button
          @click="showHeuristicConfig = true"
          class="text-white/60 hover:text-white transition-colors"
          title="Configure Bot AI"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </h2>

      <div class="space-y-5">
        <!-- Player Name -->
        <div>
          <label class="block text-white/80 mb-2 text-sm font-medium">Your Name</label>
          <input
            ref="nameInput"
            v-model="playerName"
            type="text"
            placeholder="Enter your name"
            maxlength="20"
            @keydown.enter="handleCreate"
            class="w-full glass-light text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/40"
          />
          <p v-if="error" class="text-red-400 text-xs mt-1">{{ error }}</p>
        </div>

        <!-- Player Count Selection -->
        <div>
          <label class="block text-white/80 mb-3 text-sm font-medium">
            Number of Human Players (including you)
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="count in [1, 2, 3, 4]"
              :key="count"
              @click="humanPlayers = count"
              class="glass-light hover:bg-white/20 py-3 rounded-lg transition-all font-semibold"
              :class="
                humanPlayers === count
                  ? 'bg-white/30 text-white ring-2 ring-white/50'
                  : 'text-white/70'
              "
            >
              {{ count }}
            </button>
          </div>
        </div>

        <!-- Bot Count Selection -->
        <div>
          <label class="block text-white/80 mb-3 text-sm font-medium"> Number of Bots </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="count in [0, 1, 2, 3]"
              :key="count"
              @click="botCount = count"
              :disabled="humanPlayers + count > 4"
              class="glass-light hover:bg-white/20 py-3 rounded-lg transition-all font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              :class="
                botCount === count ? 'bg-white/30 text-white ring-2 ring-white/50' : 'text-white/70'
              "
            >
              {{ count }}
            </button>
          </div>
        </div>

        <!-- Total Summary -->
        <div class="glass-strong rounded-lg p-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-white/70">Total Players:</span>
            <span class="text-white font-bold">{{ totalPlayers }} / 4</span>
          </div>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-white/70">Waiting Slots:</span>
            <span class="text-white font-bold">{{ waitingSlots }}</span>
          </div>
          <p class="text-white/50 text-xs mt-3">
            {{ waitingSlots > 0 ? 'Other players can join the waiting slots' : 'Room is full' }}
          </p>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeModal"
            class="flex-1 glass-light hover:bg-white/15 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            @click="handleCreate"
            :disabled="!playerName.trim() || totalPlayers < 2"
            class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600"
          >
            Create Room
          </button>
        </div>

        <p class="text-white/50 text-xs text-center mt-4">
          💡 Press <kbd class="glass px-2 py-0.5 rounded text-white/70">Enter</kbd> to create • ⚙️
          Configure Bot AI
        </p>
      </div>
    </div>
  </div>

  <!-- Heuristic Config Modal -->
  <HeuristicConfigModal
    :show="showHeuristicConfig"
    :weights="heuristicWeights"
    @close="showHeuristicConfig = false"
    @save="handleSaveHeuristic"
  />
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import HeuristicConfigModal from './HeuristicConfigModal.vue'
import type { HeuristicWeights } from '@/types/game'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  create: [
    config: {
      playerName: string
      humanPlayers: number
      bots: number
      heuristicWeights: HeuristicWeights
    },
  ]
}>()

const playerName = ref('')
const error = ref('')
const nameInput = ref<HTMLInputElement>()
const humanPlayers = ref(1) // Including the creator
const botCount = ref(3)
const showHeuristicConfig = ref(false)

const heuristicWeights = ref<HeuristicWeights>({
  win: 10000,
  blockOpponent3: 5000,
  create3InRow: 1000,
  create2InRow: 100,
  cardValue: 10,
  centerControl: 5,
  replacement: 50,
})

const totalPlayers = computed(() => humanPlayers.value + botCount.value)
const waitingSlots = computed(() => 4 - totalPlayers.value)

// Automatically adjust bot count if total exceeds 4
watch(humanPlayers, (newVal) => {
  if (newVal + botCount.value > 4) {
    botCount.value = 4 - newVal
  }
})

// Focus input when modal opens
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      playerName.value = ''
      error.value = ''
      humanPlayers.value = 1
      botCount.value = 3
      nextTick(() => {
        nameInput.value?.focus()
      })
    }
  },
)

function closeModal() {
  emit('close')
}

function handleCreate() {
  const name = playerName.value.trim()

  if (!name) {
    error.value = 'Please enter your name'
    return
  }

  if (name.length < 2) {
    error.value = 'Name must be at least 2 characters'
    return
  }

  if (totalPlayers.value < 2) {
    error.value = 'Need at least 2 players/bots to start'
    return
  }

  emit('create', {
    playerName: name,
    humanPlayers: humanPlayers.value,
    bots: botCount.value,
    heuristicWeights: { ...heuristicWeights.value },
  })
}

function handleSaveHeuristic(weights: HeuristicWeights) {
  heuristicWeights.value = weights
}
</script>
