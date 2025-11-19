<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 waiting-room-bg">
    <div class="relative z-10 w-full max-w-2xl p-8 glass-card rounded-2xl animate-slide-in">
      <div class="mb-8 text-center">
        <h2 class="mb-3 text-3xl font-bold text-white">Waiting Room</h2>
        <p class="text-sm text-white/70">
          {{
            isRoomMaster
              ? 'Waiting for players to join...'
              : 'Waiting for host to start the game...'
          }}
        </p>
      </div>

      <!-- Room Code -->
      <div class="p-6 mb-6 text-center glass-strong rounded-xl">
        <p class="mb-2 text-sm text-white/70">Room Code</p>
        <div class="flex items-center justify-center gap-3">
          <span class="font-mono text-4xl font-bold tracking-wider text-white">
            {{ roomCode }}
          </span>
          <button
            @click="copyRoomCode"
            class="p-3 transition-all rounded-lg glass-light hover:bg-white/20 group"
            title="Copy room code"
          >
            <svg
              v-if="!copied"
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 transition-colors text-white/70 group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
        <p class="mt-3 text-xs text-white/50">Share this code with your friends!</p>
      </div>

      <!-- Player Slots -->
      <div class="mb-6 space-y-3">
        <div v-for="(slot, index) in slots" :key="slot.id" class="p-4 rounded-lg glass-light">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <!-- Color Indicator -->
              <div
                class="flex items-center justify-center w-12 h-12 font-bold text-white rounded-full shadow-lg"
                :class="`bg-player-${slot.color}`"
              >
                {{ index + 1 }}
              </div>

              <!-- Player Info -->
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-white">
                    {{
                      slot.type === 'player'
                        ? slot.player?.name
                        : slot.type === 'bot'
                          ? `Bot ${index + 1}`
                          : getWaitingSlotLabel()
                    }}
                  </span>
                  <span
                    v-if="slot.type === 'bot'"
                    class="glass px-2 py-0.5 rounded text-xs text-white/70 font-medium"
                  >
                    BOT
                  </span>
                  <span
                    v-if="slot.player?.id === roomMaster"
                    class="bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded text-xs text-yellow-300 font-medium"
                  >
                    👑 HOST
                  </span>
                </div>
                <p class="mt-1 text-xs text-white/50">
                  {{
                    slot.type === 'player'
                      ? 'Ready'
                      : slot.type === 'bot'
                        ? 'AI Player'
                        : getWaitingSlotDescription()
                  }}
                </p>
              </div>
            </div>

            <!-- Actions (only for room master on waiting slots) - Desktop -->
            <button
              v-if="isRoomMaster && slot.type === 'waiting'"
              @click="convertToBot(index)"
              class="items-center hidden gap-2 px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg md:flex glass-strong hover:bg-white/20"
            >
              <span>🤖</span>
              <span>Add Bot</span>
            </button>
          </div>

          <!-- Actions (only for room master on waiting slots) - Mobile -->
          <button
            v-if="isRoomMaster && slot.type === 'waiting'"
            @click="convertToBot(index)"
            class="flex items-center justify-center w-full gap-2 px-4 py-2 mt-3 text-sm font-semibold text-white transition-all rounded-lg md:hidden glass-strong hover:bg-white/20"
          >
            <span>🤖</span>
            <span>Add Bot</span>
          </button>
        </div>
      </div>

      <!-- Player Count - Only show for room master -->
      <div v-if="isRoomMaster" class="p-4 mb-6 rounded-lg glass-strong">
        <div class="flex items-center justify-between">
          <span class="text-sm text-white/70">Players Ready:</span>
          <span class="text-lg font-bold text-white">{{ playersReady }} / {{ totalSlots }}</span>
        </div>
        <div class="w-full h-2 mt-3 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
            :style="{ width: `${(playersReady / totalSlots) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Start Button (only for room master) -->
      <div v-if="isRoomMaster" class="space-y-3">
        <button
          @click="startGame"
          :disabled="playersReady < 2"
          class="w-full px-6 py-4 text-lg font-bold text-white transition-all shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600"
        >
          {{ playersReady >= 2 ? '🚀 Start Game' : '⏳ Waiting for more players...' }}
        </button>
        <p class="text-xs text-center text-white/50">
          {{
            playersReady < 2 ? 'Need at least 2 players/bots to start' : 'Click to begin the match!'
          }}
        </p>
      </div>

      <!-- Waiting message for non-host -->
      <div v-else class="text-center">
        <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-light">
          <div class="animate-pulse">
            <div class="flex gap-1">
              <div class="w-2 h-2 rounded-full bg-white/70 animate-bounce"></div>
              <div class="w-2 h-2 delay-100 rounded-full bg-white/70 animate-bounce"></div>
              <div class="w-2 h-2 delay-200 rounded-full bg-white/70 animate-bounce"></div>
            </div>
          </div>
          <span class="text-sm font-medium text-white/70">
            Waiting for host to start the game...
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RoomSlot } from '@/types/game'

interface Props {
  show: boolean
  roomCode: string
  slots: RoomSlot[]
  roomMaster: string
  currentPlayerId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  start: []
  convertToBot: [slotIndex: number]
}>()

const copied = ref(false)

const isRoomMaster = computed(() => props.currentPlayerId === props.roomMaster)
const totalSlots = computed(() => props.slots.length)
const playersReady = computed(() => {
  return props.slots.filter((slot) => slot.type === 'player' || slot.type === 'bot').length
})

// Helper to determine label for waiting slots
function getWaitingSlotLabel(): string {
  return 'Waiting for Player...'
}

function getWaitingSlotDescription(): string {
  return 'Can be filled by human or converted to bot'
}

async function copyRoomCode() {
  try {
    await navigator.clipboard.writeText(props.roomCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

function convertToBot(slotIndex: number) {
  emit('convertToBot', slotIndex)
}

function startGame() {
  if (playersReady.value >= 2) {
    emit('start')
  }
}
</script>

<style scoped>
.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
