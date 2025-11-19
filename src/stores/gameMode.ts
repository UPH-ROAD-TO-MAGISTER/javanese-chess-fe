/**
 * Game Mode Store - Manages Demo vs API mode
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type GameMode = 'demo' | 'api'

export const useGameModeStore = defineStore('gameMode', () => {
  const mode = ref<GameMode>('api') // Default to API mode

  function setMode(newMode: GameMode) {
    mode.value = newMode
    localStorage.setItem('gameMode', newMode)
  }

  function loadMode() {
    const saved = localStorage.getItem('gameMode') as GameMode | null
    if (saved && (saved === 'demo' || saved === 'api')) {
      mode.value = saved
    }
  }

  function isDemoMode() {
    return mode.value === 'demo'
  }

  function isApiMode() {
    return mode.value === 'api'
  }

  // Load mode on initialization
  loadMode()

  return {
    mode,
    setMode,
    loadMode,
    isDemoMode,
    isApiMode,
  }
})
