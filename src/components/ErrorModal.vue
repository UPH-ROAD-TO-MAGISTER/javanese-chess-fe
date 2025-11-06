<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative glass-strong rounded-2xl p-8 max-w-md w-full shadow-2xl animate-bounce-in">
          <div class="text-center">
            <div class="text-6xl mb-4">{{ isError ? '❌' : '⚠️' }}</div>
            <h2 class="text-2xl font-black text-white mb-3">
              {{ title || (isError ? 'Error' : 'Alert') }}
            </h2>
            <p class="text-white/80 text-base mb-6 whitespace-pre-line">
              {{ message }}
            </p>
            <button
              @click="emit('close')"
              class="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              {{ buttonText || 'OK' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  message: string
  isError?: boolean
  buttonText?: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.animate-bounce-in {
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
