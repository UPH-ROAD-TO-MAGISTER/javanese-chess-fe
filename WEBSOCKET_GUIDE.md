# WebSocket Integration Guide

## 📡 Overview

WebSocket digunakan untuk komunikasi real-time antara frontend dan backend selama gameplay. Setiap room memiliki koneksi WebSocket tersendiri.

**WebSocket URL Format:**
```
ws://98.70.41.170:9000/ws?room_code={room_code}
```

**Example:**
```
ws://98.70.41.170:9000/ws?room_code=07MD
```

---

## 🔄 Message Flow

### **Connection Flow:**
1. User klik "Start Game" di waiting room
2. Frontend call API `/api/play` untuk initialize game
3. Backend return response dengan `room_code`, `players`, `turn_order`, dan `board`
4. Frontend connect ke WebSocket: `ws://BASE_URL/ws/{room_code}`
5. Game dimulai

---

## 📤 Messages TO Backend (Actions)

### 1. **Human Move**
Dikirim saat human player menempatkan kartu di board.

```typescript
{
  "action": "human_move",
  "data": {
    "player_id": "uuid-player",  // ID dari player
    "x": 4,                       // Kolom (0-8)
    "y": 3,                       // Baris (0-8)
    "card": 3                     // Card value (1-9)
  }
}
```

**Frontend Code:**
```typescript
apiGameStore.makeMove(x, y, cardValue)
// atau
wsService.sendHumanMove(playerId, x, y, card)
```

### 2. **Bot Move Request**
Dikirim untuk trigger bot untuk bergerak.

```typescript
{
  "action": "bot_move",
  "data": {
    "room_code": "NADNAS"  // Room code
  }
}
```

**Frontend Code:**
```typescript
wsService.sendBotMove(roomCode)
```

**Auto-trigger:** Bot akan otomatis dipanggil setelah human move jika next player adalah bot.

---

## 📥 Messages FROM Backend (Events)

### 1. **State Updated Event** (MAIN EVENT)
Dikirim setelah SETIAP move (human atau bot). Ini adalah event utama yang update seluruh state game.

```typescript
{
  "action": "state-updated",
  "data": {
    "room": {
      "code": "17U3",
      "board": {
        "size": 9,
        "cells": [[...]]  // Updated board state
      },
      "players": [
        {
          "id": "player-uuid",
          "name": "Rama",
          "isBot": false,
          "hand": [3, 2, 7],  // Updated hand
          "color": "red"
        },
        {
          "id": "bot-uuid",
          "name": "Bot",
          "isBot": true,
          "hand": [6, 8, 1],
          "color": "purple"
        }
      ],
      "turn_idx": 0,           // Current turn index (0-based)
      "winner_id": null,       // null or player ID if game ended
      "draw": false,           // true if game ended in draw
      "created_at": "2025-11-06T08:56:33.384807444Z",
      "room_config": {
        "room_code": "17U3",
        "weights": {...}      // Heuristic weights
      },
      "turn_order": [          // Array of player IDs
        "bot-uuid-1",
        "player-uuid", 
        "bot-uuid-2",
        "bot-uuid-3"
      ]
    }
  }
}
```

**Frontend Handling:**
- Update `board` state
- Update `turnOrder` with fresh player data (including updated hands)
- Update `currentTurnIndex` from `turn_idx`
- Check `winner_id` for game end
- Check `draw` for draw condition
- Auto-trigger bot if next player is bot

**Important:** Backend automatically updates hands setelah setiap move! Frontend tidak perlu manually add/remove cards.

### 2. **Game End Event**
Dikirim saat game selesai (ada pemenang atau draw).

```typescript
{
  "action": "game_end",
  "data": {
    "winner": {
      "id": "player-uuid",
      "name": "Winner Name",
      "isBot": false
    },
    "win_type": "horizontal",  // horizontal | vertical | diagonal | draw
    "winning_positions": [     // Positions of winning cards (optional)
      { "x": 0, "y": 0 },
      { "x": 1, "y": 0 },
      { "x": 2, "y": 0 },
      { "x": 3, "y": 0 }
    ]
  }
}
```

**Frontend Handling:**
- Set `gameStatus` to 'finished'
- Store winner info
- Show win dialog dengan winner details

### 3. **Error Event**
Dikirim saat terjadi error (invalid move, dll).

```typescript
{
  "action": "error",
  "data": {
    "message": "Invalid move: Cell already occupied",
    "code": "INVALID_MOVE"  // Optional error code
  }
}
```

**Frontend Handling:**
- Show error modal/notification
- Allow user to retry

---

## 🔌 Frontend Implementation

### **WebSocket Service** (`src/services/websocket.ts`)

```typescript
import { wsService } from '@/services/websocket'

// Connect to room
await wsService.connect(roomCode)

// Send human move
wsService.sendHumanMove(playerId, x, y, card)

// Request bot move
wsService.sendBotMove(roomCode)

// Listen to events
wsService.on('state-updated', (data) => {
  console.log('State updated:', data)
  // Full game state received, update everything
})

wsService.on('game_end', (data) => {
  console.log('Game ended:', data)
})

wsService.on('error', (data) => {
  console.log('Error:', data)
})

// Check connection status
if (wsService.isConnected()) {
  // ...
}

// Disconnect
wsService.disconnect()
```

### **API Game Store** (`src/stores/apiGame.ts`)

```typescript
import { useApiGameStore } from '@/stores/apiGame'

const apiGameStore = useApiGameStore()

// Initialize game (calls API and connects WebSocket)
await apiGameStore.initializeGame({
  playerName: 'John',
  roomId: 'ROOM123',
  numberOfBots: 2,
  numberOfPlayers: 2,
  heuristicWeights: {...}
})

// Make a move (sends via WebSocket)
apiGameStore.makeMove(x, y, cardValue)

// Access game state
console.log('Current player:', apiGameStore.currentPlayer)
console.log('My hand:', apiGameStore.myHand)
console.log('Is my turn:', apiGameStore.isMyTurn)

// Access game end state
if (apiGameStore.gameStatus === 'finished') {
  console.log('Winner:', apiGameStore.winner)
  console.log('Win type:', apiGameStore.winType)
}

// Check for errors
if (apiGameStore.lastError) {
  console.error('Error:', apiGameStore.lastError)
}
```

---

## 🎮 Game Flow Example

### **Scenario: 2 Humans vs 2 Bots**

```
1. User A creates room and clicks "Start Game"
   → API call to /api/play
   → Backend returns initial state with turn_order: [Human A, Bot 1, Human B, Bot 2]
   → Frontend connects WebSocket
   → Backend sends initial `state-updated` event
   → Show "Human A starts first!"

2. Human A places card (3) at position (4, 4)
   → Frontend sends: { action: "human_move", data: { player_id: "A", x: 4, y: 4, card: 3 }}
   → Backend processes move
   → Backend sends: { action: "state-updated", data: { room: { board: [...], players: [...], turn_idx: 1 }}}
   → Frontend updates board and players
   → Frontend sees next player is Bot 1

3. Frontend auto-triggers bot
   → Frontend sends: { action: "bot_move", data: { room_code: "ROOM123" }}
   → Backend calculates bot move
   → Backend sends: { action: "state-updated", data: { ... }}
   → Frontend updates board
   → Next player is Human B

4. Human B makes move
   → ... repeat process

5. After 20 moves, Bot 2 gets 4-in-a-row
   → Backend sends: { action: "state-updated", data: { room: { winner_id: "bot-2-id", ... }}}
   → Frontend detects winner_id is not null
   → Frontend shows win dialog: "Bot 2 wins! (Horizontal)"
```

---

## 🔍 Debugging

### **Console Logs:**

**WebSocket Connection:**
```
WebSocket connected to room: ROOM123
Game initialized: { roomCode: "ROOM123", status: "playing", players: 4 }
```

**State Updates:**
```
State updated event received: { action: "state-updated", data: {...} }
Board updated from WebSocket
Turn index updated to: 1
Players updated: 4
Next player is bot, triggering bot move...
```

**Game End:**
```
Game ended, winner: Bot 2
Winner: Bot 2
```

**Errors:**
```
WebSocket error event received: { action: "error", data: {...} }
Error from server: Invalid move: Cell already occupied
```

### **Network Tab (Chrome DevTools):**

1. Filter by "WS" untuk lihat WebSocket frames
2. Click pada connection `ws://98.70.41.170:9000/ws/ROOM123`
3. Tab "Messages" untuk lihat semua messages sent/received
4. Green (↑) = Sent to server
5. White (↓) = Received from server

---

## ⚠️ Error Handling

### **Connection Errors:**
- WebSocket gagal connect → Show error modal
- Auto-reconnect: Max 5 attempts dengan delay 3 detik
- After max attempts → Redirect ke home dengan error message

### **Move Errors:**
- Invalid move → Backend sends error event
- Frontend shows error notification
- User can retry (no state change)

### **Timeout:**
- WebSocket disconnect → Auto-reconnect
- If reconnect fails → Show "Connection lost" modal

---

## 📊 State Synchronization

**Important:** Backend adalah source of truth!

- ✅ **Board state:** Always use data from `move_made` event
- ✅ **Turn order:** Always use `next_player_index` from backend
- ✅ **Player hands:** Update from `drawn_card` in response
- ❌ **Don't** optimistically update board before receiving response
- ✅ **Do** optimistically remove card from hand (rollback on error)

---

## 🧪 Testing Checklist

### **Human Move:**
- [ ] Click card → Click cell → Move sent via WebSocket
- [ ] Board updates after move
- [ ] Card removed from hand
- [ ] New card drawn (if deck not empty)
- [ ] Turn switches to next player

### **Bot Move:**
- [ ] Auto-triggered when bot's turn
- [ ] Board updates after bot move
- [ ] Turn switches to next player (human or bot)
- [ ] Multiple bots in sequence work correctly

### **Game End:**
- [ ] Win detection works (4-in-a-row)
- [ ] Winner announced correctly
- [ ] Win type displayed (horizontal/vertical/diagonal)
- [ ] Winning positions highlighted (if provided)
- [ ] No more moves allowed after game end

### **Error Handling:**
- [ ] Invalid move shows error
- [ ] WebSocket disconnect triggers reconnect
- [ ] Error modal displays backend error messages
- [ ] Can recover from errors gracefully

---

## 🚀 Next Steps

1. **Test WebSocket connectivity:**
   ```bash
   # Using websocat (install: brew install websocat)
   websocat ws://98.70.41.170:9000/ws?room_code=TEST123
   
   # Send test message:
   {"action":"bot_move","data":{"room_code":"TEST123"}}
   ```

2. **Implement UI for game end:**
   - Show winner in RoomView
   - Highlight winning positions on board
   - Add "Play Again" button

3. **Improve error UX:**
   - Replace alert() with modal
   - Show reconnection progress
   - Add retry button for failed moves

4. **Add loading states:**
   - Show spinner when waiting for bot
   - Disable board during opponent's turn
   - Loading overlay during API calls

---

**Status:** ✅ WebSocket integration complete and ready for testing!
