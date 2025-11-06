# API Mode Integration

This document describes the API mode implementation for connecting to the backend server.

## Overview

The application now supports two modes:
- **Demo Mode**: Frontend-only gameplay with local AI
- **API Mode**: Backend-connected gameplay with WebSocket real-time updates

## File Structure

```
src/
├── services/
│   ├── api.ts           # HTTP API service (REST endpoints)
│   └── websocket.ts     # WebSocket service (real-time communication)
├── stores/
│   ├── apiGame.ts       # Game store for API mode
│   └── gameMode.ts      # Mode switcher store
└── types/
    └── api.ts           # TypeScript types for API/WS
```

## Configuration

Environment variables in `.env`:
```env
VITE_API_BASE_URL=http://98.70.41.170:9000
VITE_WS_BASE_URL=ws://98.70.41.170:9000
```

## API Endpoints

### 1. Get Default Heuristic
```
GET /api/config/weights/default
```

**Response:**
```json
{
  "weights": {
    "w_win": 10000,
    "w_threat": 200,
    "legal_move": 30,
    ...
  }
}
```

**Usage:**
```typescript
import { apiService } from '@/services/api'

const weights = await apiService.getDefaultHeuristic()
```

### 2. Start Game
```
POST /api/play
```

**Request:**
```json
{
  "number_bot": 3,
  "number_player": 1,
  "player_name": "Rama",
  "room_id": "NADNAS",
  "weights": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "room_code": "NADNAS",
    "status": "playing",
    "board": { "size": 9, "cells": [...] },
    "turn_order": [...]
  }
}
```

**Usage:**
```typescript
import { apiService } from '@/services/api'

const response = await apiService.startGame({
  playerName: 'Rama',
  roomId: 'NADNAS',
  numberOfBots: 3,
  numberOfPlayers: 1,
  heuristicWeights: weights
})
```

## WebSocket Communication

### Connection
```typescript
import { wsService } from '@/services/websocket'

await wsService.connect(roomCode)
```

### Human Move
```typescript
wsService.sendHumanMove(playerId, x, y, cardValue)
```

Sends:
```json
{
  "action": "human_move",
  "data": {
    "player_id": "...",
    "x": 4,
    "y": 3,
    "card": 5
  }
}
```

### Bot Move
```typescript
wsService.sendBotMove(roomCode)
```

Sends:
```json
{
  "action": "bot_move",
  "data": {
    "room_code": "NADNAS"
  }
}
```

### Listening to Events
```typescript
wsService.on('move-made', (data) => {
  console.log('Move made:', data)
  // Update UI
})

wsService.on('game-end', (data) => {
  console.log('Game ended:', data)
  // Show winner
})
```

## Store Usage

### API Game Store
```typescript
import { useApiGameStore } from '@/stores/apiGame'

const apiGame = useApiGameStore()

// Initialize game
await apiGame.initializeGame({
  playerName: 'Rama',
  roomId: 'NADNAS',
  numberOfBots: 3,
  numberOfPlayers: 1,
  heuristicWeights: weights
})

// Make a move
apiGame.makeMove(4, 4, 5) // x, y, card

// Access state
console.log(apiGame.myHand) // [5, 8, 3, 9, 2]
console.log(apiGame.isMyTurn) // true/false
console.log(apiGame.currentPlayer) // { id, name, isBot, ... }
```

### Game Mode Store
```typescript
import { useGameModeStore } from '@/stores/gameMode'

const gameMode = useGameModeStore()

// Switch mode
gameMode.setMode('api') // or 'demo'

// Check mode
if (gameMode.isApiMode()) {
  // Use API game store
} else {
  // Use demo game store
}
```

## Integration Flow

### 1. Settings Page
User can switch between Demo and API mode in Settings.

### 2. Create Room (API Mode)
```typescript
// In HomeView.vue or CreateRoomModal.vue
if (gameMode.isApiMode()) {
  // API mode flow
  const apiGame = useApiGameStore()
  
  // Get default heuristic from backend
  const defaultWeights = await apiService.getDefaultHeuristic()
  
  // Initialize game with backend
  await apiGame.initializeGame({
    playerName: config.playerName,
    roomId: generateRoomCode(),
    numberOfBots: config.bots,
    numberOfPlayers: config.humanPlayers,
    heuristicWeights: config.heuristicWeights
  })
  
  // Navigate to room
  router.push(`/room/${apiGame.roomCode}`)
} else {
  // Demo mode flow (existing logic)
}
```

### 3. Gameplay
```typescript
// In RoomView.vue or Board component
const apiGame = useApiGameStore()
const gameMode = useGameModeStore()

function handleCardPlace(x: number, y: number, card: number) {
  if (gameMode.isApiMode()) {
    // API mode: Send to backend via WebSocket
    apiGame.makeMove(x, y, card)
  } else {
    // Demo mode: Use local game logic
    demoGame.placeCard(x, y, card)
  }
}
```

## Type Conversions

The frontend uses different heuristic weight names than the backend. Automatic conversion is handled in `api.ts`:

```typescript
// Frontend → Backend
convertToBackendWeights(frontendWeights)

// Backend → Frontend
convertToFrontendWeights(backendWeights)
```

## Error Handling

```typescript
try {
  await apiGame.initializeGame(config)
} catch (error) {
  console.error('Failed to start game:', error)
  // Show error notification
  // Fall back to demo mode?
}
```

## TODO

- [ ] Implement reconnection logic for WebSocket
- [ ] Add loading states for API calls
- [ ] Add error notifications
- [ ] Implement game end modal
- [ ] Add spectator mode support
- [ ] Implement multiplayer (>1 human player)

## Notes

- Demo mode code remains unchanged for backward compatibility
- API mode is completely separate and doesn't affect demo mode
- WebSocket automatically triggers bot moves when it's bot's turn
- Board state is synced from backend after each move
