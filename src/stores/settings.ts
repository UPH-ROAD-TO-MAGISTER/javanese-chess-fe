import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Settings, VisualSettings, HeuristicConfig } from '@/types/settings'
import { DEFAULT_VISUAL_SETTINGS, DEFAULT_HEURISTIC_CONFIG } from '@/types/settings'

const STORAGE_KEY = 'javanese-chess-settings'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const visual = ref<VisualSettings>({ ...DEFAULT_VISUAL_SETTINGS })
  const heuristic = ref<HeuristicConfig>({ ...DEFAULT_HEURISTIC_CONFIG })

  // Getters
  const settings = computed<Settings>(() => ({
    visual: visual.value,
    heuristic: heuristic.value,
  }))

  // Actions
  function loadSettings() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Settings
        visual.value = { ...DEFAULT_VISUAL_SETTINGS, ...parsed.visual }
        heuristic.value = { ...DEFAULT_HEURISTIC_CONFIG, ...parsed.heuristic }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  function updateVisualSettings(newSettings: Partial<VisualSettings>) {
    visual.value = { ...visual.value, ...newSettings }
    saveSettings()
  }

  function updateHeuristicConfig(newConfig: Partial<HeuristicConfig>) {
    heuristic.value = { ...heuristic.value, ...newConfig }
    saveSettings()
  }

  function resetToDefaults() {
    visual.value = { ...DEFAULT_VISUAL_SETTINGS }
    heuristic.value = { ...DEFAULT_HEURISTIC_CONFIG }
    saveSettings()
  }

  function toggleVisualSetting(key: keyof VisualSettings) {
    visual.value[key] = !visual.value[key]
    saveSettings()
  }

  // Load settings on initialization
  loadSettings()

  return {
    // State
    visual,
    heuristic,
    settings,

    // Actions
    loadSettings,
    saveSettings,
    updateVisualSettings,
    updateHeuristicConfig,
    resetToDefaults,
    toggleVisualSetting,
  }
})
