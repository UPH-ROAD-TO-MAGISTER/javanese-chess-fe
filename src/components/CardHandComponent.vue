<template>
  <div
    class="glass-card p-3 flex-shrink-0 relative"
    :class="[
      isPlayerTurn && !disabled
        ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent'
        : '',
      disabled ? 'opacity-60' : '',
    ]"
  >
    <!-- Turn Indicator -->
    <div
      v-if="isPlayerTurn && !disabled"
      class="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-400 text-black text-xs font-bold px-3 py-0.5 rounded-full shadow-lg animate-pulse"
    >
      YOUR TURN - Play a card!
    </div>

    <h3 class="text-sm font-semibold text-white mb-2">
      Your Cards
      <span v-if="!isPlayerTurn && !disabled" class="text-[10px] text-white/50 ml-2"
        >(Waiting...)</span
      >
    </h3>

    <div v-if="cards.length > 0" class="flex flex-wrap gap-2.5">
      <div
        v-for="card in cards"
        :key="card.id"
        :draggable="!disabled"
        @click="handleCardClick(card)"
        @dragstart="handleDragStart($event, card)"
        @dragend="handleDragEnd"
        class="card-item glass-strong rounded-xl p-4 cursor-pointer transition-all hover:scale-110 hover:shadow-2xl min-w-[65px] relative overflow-hidden"
        :class="[
          `border-3 border-player-${card.color}`,
          `card-gradient-${card.color}`,
          disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-2',
          selectedCard?.id === card.id
            ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-transparent scale-110 shadow-2xl shadow-yellow-500/50'
            : '',
          highlightedCards && highlightedCards.includes(card.id)
            ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-transparent scale-105 !bg-blue-500/30 !border-blue-400 shadow-2xl shadow-blue-500/50 brightness-125 card-pulse'
            : '',
          isPlayerTurn && !disabled ? 'hover:shadow-green-400/50 card-glow' : '',
        ]"
      >
        <!-- Card background pattern -->
        <div class="card-pattern"></div>

        <!-- Card shine effect -->
        <div class="card-shine"></div>

        <!-- Card content -->
        <div class="text-center relative z-10">
          <div class="text-3xl font-black text-white mb-1.5 card-value drop-shadow-lg">
            {{ card.value }}
          </div>
          <div
            class="w-6 h-6 rounded-full mx-auto shadow-lg card-color-indicator"
            :class="`bg-player-${card.color}`"
          ></div>
        </div>
      </div>
    </div>

    <div v-else class="text-white/60 text-sm text-center py-4">No cards in hand</div>

    <div
      v-if="
        cards.length > 0 &&
        isPlayerTurn &&
        !disabled &&
        highlightedCards &&
        highlightedCards.length > 0
      "
      class="mt-3 text-blue-400 text-xs text-center font-semibold animate-pulse"
    >
      💡 Click highlighted card to deploy
    </div>
    <div
      v-else-if="cards.length > 0 && isPlayerTurn && !disabled"
      class="mt-3 text-green-400 text-xs text-center font-semibold"
    >
      <span class="md:hidden">📱 Tap card → Tap board cell</span>
      <span class="hidden md:inline">✨ Click card → Click board cell • Or drag to board</span>
    </div>
    <div v-else-if="cards.length > 0" class="mt-2 text-white/50 text-xs text-center">
      <span class="md:hidden">Tap to select</span>
      <span class="hidden md:inline">Click to select • Or drag to board</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '@/types/game'

interface Props {
  cards: Card[]
  disabled?: boolean
  isPlayerTurn?: boolean
  selectedCard?: Card | null
  highlightedCards?: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  cardClick: [card: Card]
  cardDragStart: [card: Card]
  cardDragEnd: []
}>()

function handleCardClick(card: Card) {
  emit('cardClick', card)
}

function handleDragStart(event: DragEvent, card: Card) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(card))
  }
  emit('cardDragStart', card)
}

function handleDragEnd() {
  emit('cardDragEnd')
}
</script>

<style scoped>
.card-item {
  min-width: 65px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.1);
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  position: relative;
}

/* Player color gradients for cards */
.card-gradient-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.card-gradient-red {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
}

.card-gradient-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.card-gradient-purple {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%);
}

/* Card background pattern */
.card-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.02) 10px,
      rgba(255, 255, 255, 0.02) 11px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.02) 10px,
      rgba(255, 255, 255, 0.02) 11px
    );
  pointer-events: none;
  opacity: 0.6;
}

/* Card shine effect */
.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  pointer-events: none;
}

.card-item:hover:not(.opacity-50) .card-shine {
  animation: shine 0.6s ease-in-out;
}

@keyframes shine {
  to {
    transform: translateX(100%);
  }
}

/* Enhanced card value styling */
.card-value {
  text-shadow:
    0 2px 10px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 255, 255, 0.3);
  font-family: 'Arial Black', sans-serif;
  letter-spacing: -1px;
}

/* Card color indicator glow */
.card-color-indicator {
  box-shadow:
    0 0 15px currentColor,
    0 2px 8px rgba(0, 0, 0, 0.4);
}

/* Glow effect on hover */
.card-glow:hover {
  filter: brightness(1.15);
}

.card-item:hover:not(.opacity-50) {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.3),
    0 10px 10px -5px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(255, 255, 255, 0.1);
  transform: translateY(-8px) scale(1.05) rotateZ(-2deg);
}

.card-item:active:not(.opacity-50) {
  transform: translateY(-4px) scale(0.98);
}

/* Pulse animation for highlighted cards */
.card-pulse {
  animation: cardPulse 1.5s ease-in-out infinite;
}

@keyframes cardPulse {
  0%,
  100% {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(59, 130, 246, 0.6);
  }
  50% {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.3),
      0 0 60px rgba(59, 130, 246, 0.8);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
