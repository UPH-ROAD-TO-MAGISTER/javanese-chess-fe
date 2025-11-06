/**
 * API Service for Backend Integration
 */

import type {
  DefaultHeuristicResponse,
  PlayGameRequest,
  PlayGameResponse,
  BackendWeights
} from '@/types/api'
import type { HeuristicWeights } from '@/types/game'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://98.70.41.170:9000'

/**
 * Convert Frontend HeuristicWeights to Backend BackendWeights
 */
export function convertToBackendWeights(frontend: HeuristicWeights): BackendWeights {
  return {
    w_win: frontend.win,
    w_threat: frontend.detectThreat3,
    w_replace_value: frontend.overwriteThreat,
    w_block_path: frontend.blockOpponentPath,
    w_build_alignment: frontend.create3InRow,
    w_card_cost: frontend.playSmallestCard,
    legal_move: frontend.legalMove,
    replace_values_threat: {
      '1': frontend.threatCardValue1,
      '2': frontend.threatCardValue2,
      '3': frontend.threatCardValue3,
      '4': frontend.threatCardValue4,
      '5': frontend.threatCardValue5,
      '6': frontend.threatCardValue6,
      '7': frontend.threatCardValue7,
      '8': frontend.threatCardValue8,
      '9': frontend.threatCardValue9
    },
    replace_values_potential: {
      '1': frontend.potentialThreatCardValue1,
      '2': frontend.potentialThreatCardValue2,
      '3': frontend.potentialThreatCardValue3,
      '4': frontend.potentialThreatCardValue4,
      '5': frontend.potentialThreatCardValue5,
      '6': frontend.potentialThreatCardValue6,
      '7': frontend.potentialThreatCardValue7,
      '8': frontend.potentialThreatCardValue8,
      '9': frontend.potentialThreatCardValue9
    },
    replace_when_threat: frontend.overwriteThreat,
    replace_potential: frontend.overwritePotentialThreat,
    replace_pos_middle: frontend.blockThreatMiddle,
    replace_pos_side: frontend.blockThreatEdge,
    block_when_threat: frontend.blockOpponentPath,
    block_potential: frontend.blockPotentialPath,
    build_alignment_2: frontend.create2InRow,
    build_alignment_3: frontend.create3InRow,
    play_smallest_card: frontend.playSmallestCard,
    keep_near_card: frontend.placeNearOwnCard
  }
}

/**
 * Convert Backend BackendWeights to Frontend HeuristicWeights
 */
export function convertToFrontendWeights(backend: BackendWeights): HeuristicWeights {
  return {
    legalMove: backend.legal_move,
    win: backend.w_win,
    detectThreat3: backend.w_threat,
    overwriteThreat: backend.replace_when_threat,
    blockThreatMiddle: backend.replace_pos_middle,
    blockThreatEdge: backend.replace_pos_side,
    blockOpponentPath: backend.block_when_threat,
    threatCardValue1: backend.replace_values_threat['1'] || 20,
    threatCardValue2: backend.replace_values_threat['2'] || 30,
    threatCardValue3: backend.replace_values_threat['3'] || 40,
    threatCardValue4: backend.replace_values_threat['4'] || 50,
    threatCardValue5: backend.replace_values_threat['5'] || 60,
    threatCardValue6: backend.replace_values_threat['6'] || 70,
    threatCardValue7: backend.replace_values_threat['7'] || 80,
    threatCardValue8: backend.replace_values_threat['8'] || 90,
    threatCardValue9: backend.replace_values_threat['9'] || 100,
    detectPotentialThreat: backend.w_threat / 2, // Estimate
    overwritePotentialThreat: backend.replace_potential,
    blockPotentialPath: backend.block_potential,
    potentialThreatCardValue1: backend.replace_values_potential['1'] || 100,
    potentialThreatCardValue2: backend.replace_values_potential['2'] || 90,
    potentialThreatCardValue3: backend.replace_values_potential['3'] || 80,
    potentialThreatCardValue4: backend.replace_values_potential['4'] || 70,
    potentialThreatCardValue5: backend.replace_values_potential['5'] || 60,
    potentialThreatCardValue6: backend.replace_values_potential['6'] || 50,
    potentialThreatCardValue7: backend.replace_values_potential['7'] || 40,
    potentialThreatCardValue8: backend.replace_values_potential['8'] || 30,
    potentialThreatCardValue9: backend.replace_values_potential['9'] || 20,
    create2InRow: backend.build_alignment_2,
    create3InRow: backend.build_alignment_3,
    playSmallestCard: backend.play_smallest_card,
    placeNearOwnCard: backend.keep_near_card
  }
}

export const apiService = {
  /**
   * Get default heuristic weights from backend
   */
  async getDefaultHeuristic(): Promise<HeuristicWeights> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config/weights/default`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DefaultHeuristicResponse = await response.json()

      // Convert backend format to frontend format
      return convertToFrontendWeights(data.weights)
    } catch (error) {
      console.error('Failed to get default heuristic:', error)
      throw error
    }
  },

  /**
   * Get heuristic weights for a specific room
   */
  async getRoomWeights(roomCode: string): Promise<HeuristicWeights> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config/weights/room?roomCode=${roomCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Convert backend weights to frontend format
      return convertToFrontendWeights(data.weights)
    } catch (error) {
      console.error('Failed to get room weights:', error)
      throw error
    }
  },

  /**
   * Start a new game (create room and initialize)
   */
  async startGame(config: {
    playerName: string
    roomId: string
    numberOfBots: number
    numberOfPlayers: number
    heuristicWeights: HeuristicWeights
  }): Promise<PlayGameResponse> {
    try {
      const payload: PlayGameRequest = {
        number_bot: config.numberOfBots,
        number_player: config.numberOfPlayers,
        player_name: config.playerName,
        room_id: config.roomId,
        weights: convertToBackendWeights(config.heuristicWeights)
      }

      const response = await fetch(`${API_BASE_URL}/api/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PlayGameResponse = await response.json()

      if (!data.success) {
        throw new Error('Failed to start game')
      }

      return data
    } catch (error) {
      console.error('Failed to start game:', error)
      throw error
    }
  }
}
