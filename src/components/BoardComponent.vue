<template>
  <div class="board-container">
    <div class="board-grid">
      <!-- Board cells -->
      <div v-for="(row, y) in board" :key="`row-${y}`" class="board-row">
        <div
          v-for="(cell, x) in row"
          :key="`cell-${x}-${y}`"
          class="board-cell"
          :class="{
            'cell-center': x === 4 && y === 4,
            'cell-valid': cell.isValid,
            'cell-has-card': cell.card !== null,
            'cell-drag-over': isDragOver && dragOverCell?.x === x && dragOverCell?.y === y,
            'cell-clickable': selectedCard && !cell.card,
            'cell-selected': selectedCell && selectedCell.x === x && selectedCell.y === y,
          }"
          @click="handleCellClick(cell.position)"
          @dragover.prevent="handleDragOver($event, cell.position)"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop($event, cell.position)"
        >
          <!-- Cell coordinate label (for development) -->
          <span v-if="showCoordinates" class="cell-coord">{{ x }},{{ y }}</span>

          <!-- Card on cell -->
          <div v-if="cell.card" class="card-on-board" :class="`card-${cell.card.color}`">
            <span class="card-value">{{ cell.card.value }}</span>
          </div>

          <!-- Valid move indicator -->
          <div v-if="cell.isValid && !cell.card" class="valid-indicator"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Board, Position, Card } from '@/types/game'

interface Props {
  board: Board
  showCoordinates?: boolean
  selectedCard?: Card | null
  selectedCell?: Position | null
}

const props = withDefaults(defineProps<Props>(), {
  showCoordinates: false,
  selectedCard: null,
  selectedCell: null,
})

const emit = defineEmits<{
  cellClick: [position: Position]
  cardDrop: [card: Card, position: Position]
}>()

const isDragOver = ref(false)
const dragOverCell = ref<Position | null>(null)

function handleCellClick(position: Position) {
  emit('cellClick', position)
}

function handleDragOver(event: DragEvent, position: Position) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isDragOver.value = true
  dragOverCell.value = position
}

function handleDragLeave() {
  isDragOver.value = false
  dragOverCell.value = null
}

function handleDrop(event: DragEvent, position: Position) {
  event.preventDefault()
  isDragOver.value = false
  dragOverCell.value = null

  const cardData = event.dataTransfer?.getData('application/json')
  if (cardData) {
    try {
      const card = JSON.parse(cardData) as Card
      emit('cardDrop', card, position)
    } catch (error) {
      console.error('Failed to parse card data:', error)
    }
  }
}
</script>

<style scoped>
.board-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  max-width: 600px;
}

.board-grid {
  /* glass-card effect */
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);

  padding: 0.25rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.board-row {
  display: flex;
  gap: 0.1rem;
}

.board-cell {
  /* glass-light effect */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);

  position: relative;
  aspect-ratio: 1;
  flex: 1;
  min-width: 0;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.board-cell:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.cell-center {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.cell-valid {
  border-color: rgba(74, 222, 128, 0.5);
  animation: pulse-border 2s infinite;
}

.cell-has-card:hover {
  transform: scale(1.02);
}

.cell-drag-over {
  background: rgba(74, 222, 128, 0.3);
  border-color: #4ade80;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

.cell-clickable {
  cursor: pointer;
}

.cell-clickable:hover {
  background: rgba(250, 204, 21, 0.2);
  border-color: #facc15;
  box-shadow: 0 0 15px rgba(250, 204, 21, 0.3);
}

.cell-selected {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  animation: pulse 1.5s ease-in-out infinite;
}

.cell-coord {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.5rem;
  line-height: 1;
}

/* Card on board */
.card-on-board {
  /* glass-strong effect */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);

  border-radius: 0.5rem;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  animation: cardPlace 0.4s ease-out;
}

.card-green {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
}

.card-red {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.card-blue {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.card-purple {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.2);
}

.card-value {
  color: white;
  font-weight: bold;
  font-size: clamp(0.75rem, 2.5vw, 1.5rem);
}

/* Valid move indicator */
.valid-indicator {
  position: absolute;
  width: 35%;
  height: 35%;
  background: rgba(34, 197, 94, 0.3);
  border: 2px solid rgb(34, 197, 94);
  border-radius: 50%;
  animation: pulse-indicator 1.5s ease-in-out infinite;
}

@keyframes pulse-border {
  0%,
  100% {
    border-color: rgba(34, 197, 94, 0.3);
  }
  50% {
    border-color: rgba(34, 197, 94, 0.6);
  }
}

@keyframes pulse-indicator {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes cardPlace {
  0% {
    transform: scale(1.2) rotate(5deg);
    opacity: 0.7;
  }
  50% {
    transform: scale(0.9) rotate(-2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .board-grid {
    padding: 0.25rem;
  }

  .board-cell {
    border-radius: 0.125rem;
  }
}
</style>
