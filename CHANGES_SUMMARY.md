# Summary of Changes - API Mode Improvements

## ✅ Completed Updates

### 1. Updated Heuristic Weights Structure (DONE)

**Problem:** Heuristic weights tidak memiliki nilai untuk setiap kartu (1-9) pada threat dan potential threat mode.

**Solution:**
- Updated `HeuristicWeights` interface di `src/types/game.ts`
- Menghapus `threatCardValue` dan `potentialThreatCardValue`
- Menambahkan 9 properti untuk threat: `threatCardValue1` sampai `threatCardValue9`
- Menambahkan 9 properti untuk potential threat: `potentialThreatCardValue1` sampai `potentialThreatCardValue9`

**Files Updated:**
- `src/types/game.ts` - Interface definition
- `src/components/HeuristicConfigModal.vue` - UI dengan 9 sliders untuk setiap kartu
- `src/components/CreateRoomModal.vue` - Default values
- `src/services/api.ts` - Conversion functions
- `src/views/RoomView.vue` - Default fallback values

### 2. Removed Preset Buttons (DONE)

**Problem:** User meminta untuk menghapus preset Easy/Medium/Hard.

**Solution:**
- Recreated `HeuristicConfigModal.vue` tanpa preset functions
- Hanya tersisa "Reset to Default" dan "Apply Configuration" buttons
- UI lebih clean dengan grid layout 3 kolom untuk card values

**Files Updated:**
- `src/components/HeuristicConfigModal.vue` - Completely recreated

### 3. Fixed Demo/API Mode Badge (DONE)

**Problem:** Badge di homepage selalu menampilkan "DEMO MODE" bahkan ketika dalam API mode.

**Solution:**
- Added conditional rendering berdasarkan `gameModeStore.isDemoMode()`
- Demo mode: Blue badge "🎮 DEMO MODE • No Backend Required"
- API mode: Green badge "🌐 API MODE • Connected to Backend"

**Files Updated:**
- `src/views/HomeView.vue` - Badge component

### 4. Moved API Call to Waiting Room (DONE)

**Problem:** API call `/api/play` dilakukan saat user klik "Create Room", seharusnya di waiting room saat klik "Start Game".

**Why:** Supaya kalau player tidak datang, bisa di-switch jadi bot di waiting room.

**Solution:**
- **HomeView:** Hanya save config ke localStorage, tidak call API
- **RoomView:** 
  - API mode: Show waiting room dengan config
  - Call `apiGameStore.initializeGame()` saat klik "Start Game"
  - Handle success: Show first player notification
  - Handle error: Show error modal, tetap di waiting room

**Files Updated:**
- `src/views/HomeView.vue` - Removed API call, simplified room creation
- `src/views/RoomView.vue` - Added API initialization in `handleStartGame()`

### 5. Fixed Response Parsing (DONE)

**Problem:** API response structure berbeda:
```json
{
  "data": {
    "players": [...],  // Array of player objects with hand/deck
    "turn_order": [...] // Array of player IDs only
  }
}
```

**Solution:**
- Updated `PlayGameResponse` type di `src/types/api.ts`
- Separated `players` array (full player data) from `turn_order` (player IDs)
- Updated `apiGameStore.initializeGame()` to map players correctly
- Added `color` property to `TurnOrderPlayer`

**Files Updated:**
- `src/types/api.ts` - Type definitions
- `src/stores/apiGame.ts` - Response parsing logic

### 6. Fixed Error Alert (DONE)

**Problem:** Alert "Failed to create room: Unknown error" muncul padahal backend response sukses.

**Solution:**
- Removed `alert()` calls
- Created `ErrorModal.vue` component untuk error handling
- Integrated ErrorModal di HomeView dan RoomView
- Errors sekarang ditampilkan dengan modal yang lebih user-friendly

**Files Created:**
- `src/components/ErrorModal.vue` - New error modal component

**Files Updated:**
- `src/views/HomeView.vue` - Added ErrorModal, removed alert
- `src/views/RoomView.vue` - Added ErrorModal for API errors

### 7. Updated API Conversion Functions (DONE)

**Problem:** Conversion functions tidak handle card values 1-9.

**Solution:**
- Updated `convertToBackendWeights()` to map all 18 card value properties
- Updated `convertToFrontendWeights()` to parse backend dictionaries
- Threat values: Card 1 = 20, Card 9 = 100 (ascending)
- Potential threat values: Card 1 = 100, Card 9 = 20 (descending/inverted)

**Files Updated:**
- `src/services/api.ts` - Both conversion functions

---

## 🎯 How It Works Now

### Create Room Flow:

#### Demo Mode:
1. User clicks "Create Room"
2. Configure room settings
3. Click "Create Room" button
4. Save config to localStorage
5. Navigate to `/room/:code`
6. Show waiting room
7. Click "Start Game" → Initialize local game
8. Show FirstTurnModal for shuffle

#### API Mode:
1. User clicks "Create Room"
2. Configure room settings (backend defaults loaded automatically)
3. Click "Create Room" button
4. Save config to localStorage
5. Navigate to `/room/:code`
6. Show waiting room
7. **Click "Start Game" → Call API `/api/play`** ⭐
8. Backend returns: board, players, turn_order
9. Connect WebSocket
10. Show first player notification
11. Auto-trigger bot if bot's turn

### Heuristic Configuration:

**Structure:**
```typescript
{
  // Basic
  legalMove: 30,
  win: 10000,
  
  // Threat Detection
  detectThreat3: 200,
  overwriteThreat: 200,
  blockThreatMiddle: 75,
  blockThreatEdge: 50,
  blockOpponentPath: 100,
  
  // Threat Card Values (1-9)
  threatCardValue1: 20,    // Low cards = low priority
  threatCardValue2: 30,
  threatCardValue3: 40,
  threatCardValue4: 50,
  threatCardValue5: 60,
  threatCardValue6: 70,
  threatCardValue7: 80,
  threatCardValue8: 90,
  threatCardValue9: 100,   // High cards = high priority
  
  // Potential Threat
  detectPotentialThreat: 100,
  overwritePotentialThreat: 125,
  blockPotentialPath: 70,
  
  // Potential Threat Card Values (1-9) - INVERTED
  potentialThreatCardValue1: 100,  // Low cards = HIGH priority
  potentialThreatCardValue2: 90,
  potentialThreatCardValue3: 80,
  potentialThreatCardValue4: 70,
  potentialThreatCardValue5: 60,
  potentialThreatCardValue6: 50,
  potentialThreatCardValue7: 40,
  potentialThreatCardValue8: 30,
  potentialThreatCardValue9: 20,   // High cards = low priority
  
  // Strategy
  create2InRow: 50,
  create3InRow: 100,
  playSmallestCard: 60,
  placeNearOwnCard: 60
}
```

### Backend Conversion:

Frontend weights → Backend weights:
```typescript
{
  w_win: frontend.win,
  w_threat: frontend.detectThreat3,
  replace_values_threat: {
    '1': frontend.threatCardValue1,
    '2': frontend.threatCardValue2,
    // ... dan seterusnya
  },
  replace_values_potential: {
    '1': frontend.potentialThreatCardValue1,
    '2': frontend.potentialThreatCardValue2,
    // ... dan seterusnya
  },
  // ... properties lainnya
}
```

---

## 🔍 Testing Checklist

### Demo Mode (Should Work Unchanged):
- [ ] Create room
- [ ] Show waiting room
- [ ] Start game shows shuffle modal
- [ ] Play cards
- [ ] Bot AI works
- [ ] Game end detection

### API Mode:
- [ ] Badge shows "API MODE" di homepage
- [ ] Create room loads backend defaults
- [ ] Navigate to waiting room (no API call yet)
- [ ] Click "Start Game" → API call to `/api/play`
- [ ] Backend response parsed correctly (players + turn_order)
- [ ] First player notification shows
- [ ] No FirstTurnModal in API mode
- [ ] Bot triggers automatically if bot's turn
- [ ] Card placement sends WebSocket message
- [ ] Error modal shows on API failures

### Error Handling:
- [ ] Backend connection error shows modal (not alert)
- [ ] Invalid room config shows error
- [ ] API timeout handled gracefully
- [ ] User can retry after error

---

## 📝 Known Issues / Pending

1. **WebSocket Event Handlers**: Need to implement full board update logic in `handleMoveMade()`
2. **Board Rendering**: Need conditional rendering for API mode board state
3. **Hand Management**: Update card hand display from apiGameStore
4. **Game End**: Implement win dialog for API mode

---

## 🚀 Next Steps

1. Test backend connectivity: `curl http://98.70.41.170:9000/api/config/weights/default`
2. Test room creation flow in API mode
3. Implement WebSocket handlers for move updates
4. Test complete gameplay with bots
5. Polish error messages and loading states

---

**Date:** December 2024  
**Status:** Core API integration complete, ready for testing
