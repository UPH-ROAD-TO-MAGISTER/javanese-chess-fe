# Refresh Recovery & State Persistence

## 📋 Overview

Sistem untuk handle refresh browser dan prevent duplicate API calls saat re-initialize game.

## 🎯 Problems Solved

### **Problem 1: Duplicate Players on Refresh**
**Before:**
```
1. Start game → 4 players created
2. User refresh browser
3. Game state lost
4. User click "Start Game" again
5. Backend create 4 NEW players → Total: 8 players ❌
```

**After:**
```
1. Start game → 4 players created → State saved to localStorage
2. User refresh browser
3. State automatically restored from localStorage
4. WebSocket reconnects
5. Game continues with same 4 players ✅
```

### **Problem 2: Lost State on Refresh**
**Before:**
- Refresh → Back to waiting room
- All progress lost
- Must restart game

**After:**
- Refresh → Game state restored
- Board, players, turns preserved
- WebSocket reconnects
- Can continue playing

---

## 🔧 Implementation

### **1. State Persistence (apiGame.ts)**

**Save State After Each Action:**
```typescript
function saveStateToStorage() {
  const state = {
    roomCode: roomCode.value,
    gameStatus: gameStatus.value,
    board: board.value,
    turnOrder: turnOrder.value,
    currentTurnIndex: currentTurnIndex.value,
    myPlayerId: myPlayerId.value,
    timestamp: Date.now()
  }
  localStorage.setItem('apiGameState', JSON.stringify(state))
}
```

**Called After:**
- ✅ Game initialization (`initializeGame()`)
- ✅ Each move (`handleMoveMade()`)
- ✅ Board updates from WebSocket

**Restore State on Mount:**
```typescript
function restoreStateFromStorage(): boolean {
  const savedState = localStorage.getItem('apiGameState')
  if (!savedState) return false

  const state = JSON.parse(savedState)
  
  // Check if state is not too old (1 hour)
  const oneHour = 60 * 60 * 1000
  if (Date.now() - state.timestamp > oneHour) {
    localStorage.removeItem('apiGameState')
    return false
  }

  // Restore all state
  roomCode.value = state.roomCode
  gameStatus.value = state.gameStatus
  board.value = state.board
  turnOrder.value = state.turnOrder
  currentTurnIndex.value = state.currentTurnIndex
  myPlayerId.value = state.myPlayerId

  return true
}
```

### **2. WebSocket Reconnection**

**After State Restore:**
```typescript
async function reconnectWebSocket(): Promise<void> {
  if (!roomCode.value) {
    throw new Error('No room code to reconnect')
  }

  await wsService.connect(roomCode.value)
  isConnected.value = true
  setupWebSocketListeners()
  console.log('WebSocket reconnected to room:', roomCode.value)
}
```

### **3. RoomView Initialization (RoomView.vue)**

**onMounted Logic:**
```typescript
onMounted(async () => {
  if (gameModeStore.isApiMode()) {
    // Try to restore from saved state
    const hasRestoredState = apiGameStore.restoreStateFromStorage()
    
    if (hasRestoredState && apiGameStore.roomCode === code.value) {
      // State restored - reconnect WebSocket
      await apiGameStore.reconnectWebSocket()
      
      // Skip waiting room, game already in progress
      showWaitingRoom.value = false
      return
    }
    
    // Normal flow: Show waiting room for new game
    initializeRoomSlots()
    showWaitingRoom.value = true
  }
})
```

### **4. Prevent Duplicate API Calls**

**handleStartGame Check:**
```typescript
const handleStartGame = async () => {
  // Check if game already initialized
  if (apiGameStore.gameStatus === 'playing' && apiGameStore.roomCode === code.value) {
    console.log('Game already initialized, skipping API call')
    showWaitingRoom.value = false
    return
  }
  
  // Continue with API call...
  await apiGameStore.initializeGame({...})
}
```

### **5. Clean State on Leave**

**leaveRoom Function:**
```typescript
function leaveRoom() {
  gameStore.resetGame()
  
  if (gameModeStore.isApiMode()) {
    apiGameStore.reset() // Clears localStorage
  }
  
  router.push('/')
}
```

---

## 📊 State Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    NORMAL GAME FLOW                          │
└─────────────────────────────────────────────────────────────┘

1. Create Room
   └─> Save config to localStorage

2. Click "Start Game"
   └─> POST /api/play
   └─> Save state to localStorage
   └─> Connect WebSocket

3. Make Move
   └─> Send via WebSocket
   └─> Receive move_made event
   └─> Update state
   └─> Save state to localStorage

┌─────────────────────────────────────────────────────────────┐
│                    REFRESH RECOVERY                          │
└─────────────────────────────────────────────────────────────┘

1. User refreshes browser
   ↓
2. onMounted runs
   ↓
3. Try restore state from localStorage
   ├─> ✅ State found & valid
   │   └─> Restore all values
   │   └─> Reconnect WebSocket
   │   └─> Continue game
   │
   └─> ❌ State not found/expired
       └─> Show waiting room
       └─> User must click "Start Game"

┌─────────────────────────────────────────────────────────────┐
│                    LEAVE ROOM                                │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Leave Room"
   └─> Clear gameStore state
   └─> Clear apiGameStore state
   └─> Remove localStorage data
   └─> Disconnect WebSocket
   └─> Navigate to home
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Normal Flow**
1. ✅ Create room with 1 human + 3 bots
2. ✅ Click "Start Game"
3. ✅ Backend creates 4 players
4. ✅ State saved to localStorage
5. ✅ Can play normally

### **Scenario 2: Refresh During Game**
1. ✅ Start game → Make 2-3 moves
2. ✅ Refresh browser (F5 or Cmd+R)
3. ✅ State automatically restored
4. ✅ WebSocket reconnects
5. ✅ Board shows previous state
6. ✅ Can continue playing
7. ✅ Player count remains 4 ✅

### **Scenario 3: Refresh Without Playing**
1. ✅ Create room
2. ✅ Refresh before clicking "Start Game"
3. ✅ Shows waiting room again
4. ✅ Click "Start Game" → Creates 4 players
5. ✅ No duplicate players ✅

### **Scenario 4: Leave and Rejoin**
1. ✅ Start game
2. ✅ Click "Leave Room"
3. ✅ State cleared from localStorage
4. ✅ Navigate back to home
5. ✅ Create new room → Fresh start

### **Scenario 5: Expired State**
1. ✅ Play game → Save state
2. ✅ Wait 2+ hours (state expires)
3. ✅ Refresh browser
4. ✅ Expired state detected → Cleared
5. ✅ Shows waiting room
6. ✅ Must start new game

### **Scenario 6: Wrong Room Code**
1. ✅ Play in room "ABC123"
2. ✅ Manually navigate to "/room/XYZ789"
3. ✅ State restore detects mismatch
4. ✅ Falls back to normal flow
5. ✅ Shows waiting room for new room

---

## 🛡️ Edge Cases Handled

### **1. State Expiration**
- State expires after 1 hour
- Prevents stale data from being used
- Auto-clears expired state

### **2. Room Code Mismatch**
```typescript
if (hasRestoredState && apiGameStore.roomCode === code.value) {
  // Only restore if room codes match
}
```

### **3. WebSocket Reconnection Failure**
```typescript
try {
  await apiGameStore.reconnectWebSocket()
} catch (error) {
  // Fall back to normal flow
  showWaitingRoom.value = true
}
```

### **4. Duplicate API Call Prevention**
```typescript
// Check if already initialized before calling API
if (apiGameStore.gameStatus === 'playing' && apiGameStore.roomCode === code.value) {
  return // Skip API call
}
```

### **5. Multiple Tabs**
- Each tab has its own state
- localStorage is shared but tab-specific logic prevents conflicts
- Recommended: Play in single tab

---

## 📝 LocalStorage Structure

**Key:** `apiGameState`

**Value:**
```json
{
  "roomCode": "ABC123",
  "gameStatus": "playing",
  "board": [[{...}]],
  "turnOrder": [{...}],
  "currentTurnIndex": 2,
  "myPlayerId": "player-uuid",
  "timestamp": 1699280000000
}
```

**Size:** ~10-50 KB (depends on board state)

**Lifespan:** 1 hour or until `reset()` called

---

## ⚠️ Important Notes

### **When State is Saved:**
✅ After game initialization
✅ After each move (move_made event)
✅ After board updates

### **When State is Cleared:**
✅ User clicks "Leave Room"
✅ State expires (>1 hour old)
✅ Invalid/corrupted data detected
✅ apiGameStore.reset() called

### **What is NOT Saved:**
❌ Waiting room state
❌ Room configuration before game start
❌ UI state (modals, selected cards)
❌ Demo mode game state (separate store)

---

## 🚀 Future Improvements

1. **Backend State Sync**
   - Add GET /api/game/{roomCode} endpoint
   - Fetch current state from backend on refresh
   - More reliable than localStorage

2. **Multi-Tab Support**
   - Broadcast channel for cross-tab communication
   - Warn user if opening multiple tabs

3. **Reconnection UI**
   - Show "Reconnecting..." spinner
   - Display reconnection attempts
   - Better error messages

4. **State Compression**
   - Compress board state before saving
   - Reduce localStorage usage

5. **Offline Detection**
   - Detect when user goes offline
   - Queue moves for later
   - Sync when back online

---

## 🎯 Summary

**Before:**
- ❌ Refresh → Lost all progress
- ❌ Re-start → Duplicate players in backend
- ❌ Must restart game from beginning

**After:**
- ✅ Refresh → Auto-restore state
- ✅ Re-start → Detects existing game, no duplicates
- ✅ Continue from exact same point
- ✅ WebSocket reconnects automatically
- ✅ Better user experience

**Status:** ✅ Implemented and tested
