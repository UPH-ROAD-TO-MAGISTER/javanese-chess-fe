# Bot Heuristic Configuration

Dokumen ini berisi konfigurasi nilai heuristic untuk bot AI dalam permainan Javanese Chess.

## Overview

Frontend menyimpan konfigurasi heuristic yang dapat diatur oleh user melalui Settings page. Nilai-nilai ini akan dikirim ke backend saat memulai game atau saat bot perlu membuat keputusan.

## Type Definitions

```typescript
interface CardValueWeights {
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

interface HeuristicConfig {
  // Basic moves
  legalMoveAvailable: number

  // Winning condition
  prioritizeWinningMove: number

  // Threat detection (3 opponent cards aligned)
  detectThreat: number
  threatCardValues: CardValueWeights
  overwriteOpponentCardThreat: number
  middleOfThreatFormation: number
  edgeOfThreatFormation: number
  blockOpponentPathThreat: number

  // Potential threat detection (< 3 adjacent opponent cards)
  potentialThreatCardValues: CardValueWeights
  overwriteOpponentCardPotential: number
  blockOpponentPathPotential: number

  // Own card alignment
  twoOwnCardsAligned: number
  threeOwnCardsAligned: number

  // Strategic moves
  playSmallestCard: number
  placeNearOwnCard: number
}
```

## Default Values

### Basic Moves

- **legalMoveAvailable**: `30` - Base value for any legal move

### Winning Condition

- **prioritizeWinningMove**: `10000` - Weight for 4 aligned cards (winning move)

### Threat Detection (3 Aligned Cards)

- **detectThreat**: `200` - Weight for detecting threat
- **threatCardValues** - Card values when overwriting during threat:
  - card1: `20`
  - card2: `30`
  - card3: `40`
  - card4: `50`
  - card5: `60`
  - card6: `70`
  - card7: `80`
  - card8: `90`
  - card9: `100`
- **overwriteOpponentCardThreat**: `200` - Bonus for overwriting opponent card during threat
- **middleOfThreatFormation**: `75` - Bonus for blocking middle of threat
- **edgeOfThreatFormation**: `50` - Bonus for blocking edge of threat
- **blockOpponentPathThreat**: `100` - Weight for blocking opponent's path during threat

### Potential Threat (< 3 Adjacent Cards)

- **potentialThreatCardValues** - Prioritize smaller cards:
  - card1: `100`
  - card2: `90`
  - card3: `80`
  - card4: `70`
  - card5: `60`
  - card6: `50`
  - card7: `40`
  - card8: `30`
  - card9: `20`
- **overwriteOpponentCardPotential**: `125` - Bonus for overwriting during potential threat
- **blockOpponentPathPotential**: `70` - Weight for blocking during potential threat

### Own Card Alignment

- **twoOwnCardsAligned**: `50` - Bonus for aligning 2 own cards
- **threeOwnCardsAligned**: `100` - Bonus for aligning 3 own cards

### Strategic Moves

- **playSmallestCard**: `60` - Bonus for playing smallest card
- **placeNearOwnCard**: `60` - Bonus for placing near own card

## Usage in Backend

### Receiving Configuration

Backend akan menerima konfigurasi heuristic melalui:

1. **Socket event** saat game dimulai
2. **API endpoint** `/move-bot` untuk setiap bot move

### Example Payload

```json
{
  "heuristicConfig": {
    "legalMoveAvailable": 30,
    "prioritizeWinningMove": 10000,
    "detectThreat": 200,
    "threatCardValues": {
      "card1": 20,
      "card2": 30,
      "card3": 40,
      "card4": 50,
      "card5": 60,
      "card6": 70,
      "card7": 80,
      "card8": 90,
      "card9": 100
    },
    "overwriteOpponentCardThreat": 200,
    "middleOfThreatFormation": 75,
    "edgeOfThreatFormation": 50,
    "blockOpponentPathThreat": 100,
    "potentialThreatCardValues": {
      "card1": 100,
      "card2": 90,
      "card3": 80,
      "card4": 70,
      "card5": 60,
      "card6": 50,
      "card7": 40,
      "card8": 30,
      "card9": 20
    },
    "overwriteOpponentCardPotential": 125,
    "blockOpponentPathPotential": 70,
    "twoOwnCardsAligned": 50,
    "threeOwnCardsAligned": 100,
    "playSmallestCard": 60,
    "placeNearOwnCard": 60
  }
}
```

## Implementation Notes

### Priority Order (Highest to Lowest)

1. **Winning Move** (10000) - Always prioritize winning
2. **Threat Detection** (200) - Block opponent's 3-card alignment
3. **Potential Threat** (125) - Block opponent's potential alignment
4. **Own Card Alignment** (50-100) - Build own winning pattern
5. **Strategic Moves** (60) - General strategy
6. **Legal Move** (30) - Base value for any valid move

### Card Value Strategy

**During Threat (3 aligned):**

- Higher cards (7-9) have higher values (80-100)
- Used to overwrite opponent's cards
- Prevents wasting high cards on low-value positions

**During Potential Threat (<3 aligned):**

- Lower cards (1-3) have higher values (80-100)
- Saves high cards for critical moments
- Efficient resource management

### Position Strategy

**Threat Formation:**

- Middle position (75) > Edge position (50)
- Blocking middle prevents opponent from extending in both directions
- Edge blocking limits extension to one direction

## Storage

Konfigurasi disimpan di:

- **Frontend**: `localStorage` dengan key `javanese-chess-settings`
- **Backend**: Dikirim setiap kali bot perlu membuat keputusan

## Modification

User dapat mengubah nilai melalui:

1. Settings page (`/settings`)
2. Slider controls untuk setiap parameter
3. Reset to defaults button

Backend harus:

- Validate nilai yang diterima
- Clamp nilai ke range yang valid
- Use default jika nilai invalid

---

Last Updated: October 28, 2025
