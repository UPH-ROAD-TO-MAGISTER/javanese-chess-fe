/**
 * Visual settings for UI/UX
 */
export interface VisualSettings {
  showValidMoves: boolean // Highlight valid squares
  showCardPreview: boolean // Show preview before placing
  enableAnimations: boolean // Enable smooth animations
  soundEnabled: boolean // Enable sound effects (for future)
}

/**
 * Card value weights for threat situations
 */
export interface CardValueWeights {
  card1: number
  card2: number
  card3: number
  card4: number
  card5: number
  card6: number
  card7: number
  card8: number
  card9: number
}

/**
 * Bot heuristic configuration
 * Based on game strategy requirements
 */
export interface HeuristicConfig {
  // Basic moves
  legalMoveAvailable: number // Base value for any legal move

  // Winning condition
  prioritizeWinningMove: number // 4 aligned cards (winning move)

  // Threat detection (3 opponent cards aligned)
  detectThreat: number // Weight for detecting threat
  threatCardValues: CardValueWeights // Card values when overwriting during threat
  overwriteOpponentCardThreat: number // Bonus for overwriting opponent card during threat
  middleOfThreatFormation: number // Bonus for blocking middle of threat
  edgeOfThreatFormation: number // Bonus for blocking edge of threat
  blockOpponentPathThreat: number // Weight for blocking opponent's path during threat

  // Potential threat detection (< 3 adjacent opponent cards)
  potentialThreatCardValues: CardValueWeights // Prioritize smaller cards for potential threats
  overwriteOpponentCardPotential: number // Bonus for overwriting during potential threat
  blockOpponentPathPotential: number // Weight for blocking during potential threat

  // Own card alignment
  twoOwnCardsAligned: number // Bonus for aligning 2 own cards
  threeOwnCardsAligned: number // Bonus for aligning 3 own cards

  // Strategic moves
  playSmallestCard: number // Bonus for playing smallest card
  placeNearOwnCard: number // Bonus for placing near own card
}

/**
 * Default visual settings
 */
export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  showValidMoves: true,
  showCardPreview: true,
  enableAnimations: true,
  soundEnabled: false,
}

/**
 * Default heuristic values based on game strategy
 */
export const DEFAULT_HEURISTIC_CONFIG: HeuristicConfig = {
  // Basic moves
  legalMoveAvailable: 30,

  // Winning condition
  prioritizeWinningMove: 10000,

  // Threat detection (3 opponent cards aligned)
  detectThreat: 200,
  threatCardValues: {
    card1: 20,
    card2: 30,
    card3: 40,
    card4: 50,
    card5: 60,
    card6: 70,
    card7: 80,
    card8: 90,
    card9: 100,
  },
  overwriteOpponentCardThreat: 200,
  middleOfThreatFormation: 75,
  edgeOfThreatFormation: 50,
  blockOpponentPathThreat: 100,

  // Potential threat detection (< 3 adjacent opponent cards)
  potentialThreatCardValues: {
    card1: 100,
    card2: 90,
    card3: 80,
    card4: 70,
    card5: 60,
    card6: 50,
    card7: 40,
    card8: 30,
    card9: 20,
  },
  overwriteOpponentCardPotential: 125,
  blockOpponentPathPotential: 70,

  // Own card alignment
  twoOwnCardsAligned: 50,
  threeOwnCardsAligned: 100,

  // Strategic moves
  playSmallestCard: 60,
  placeNearOwnCard: 60,
}

/**
 * Settings store state
 */
export interface Settings {
  visual: VisualSettings
  heuristic: HeuristicConfig
}
