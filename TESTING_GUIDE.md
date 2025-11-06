# API Mode Testing Guide

## Prerequisites

1. **Backend Running**: Ensure backend is accessible at `http://98.70.41.170:9000`
2. **Frontend Running**: `bun run dev`
3. **Environment Variables**: Verify `.env` has correct URLs

## Quick Backend Connectivity Test

```bash
# Test if backend is reachable
curl http://98.70.41.170:9000/api/config/weights/default

# Expected response: JSON with heuristic weights
{
  "legal_move": 30,
  "w_win": 10000,
  "w_threat": 200,
  ...
}
```

## Testing Demo Mode (Baseline)

Before testing API mode, verify demo mode still works:

1. Open http://localhost:5173
2. Go to Settings → Verify "Demo Mode" is active
3. Click "Create Room"
4. Configure room (e.g., 2 players, 2 bots)
5. Start game
6. Verify shuffle modal appears
7. Play a few cards
8. Verify bot makes moves
9. Complete a game

**Expected Result**: Everything works as before (no regressions)

## Testing API Mode

### 1. Enable API Mode

1. Go to Settings
2. Click "Switch to API Mode"
3. Verify mode indicator shows "🌐 API Mode"
4. Return to Home

### 2. Test Backend Default Heuristics

1. Click "Create Room"
2. Wait for heuristic sliders to load
3. **Check Console**: Should see log like:
   ```
   Loading default heuristics from backend...
   Loaded backend defaults: {...}
   ```
4. **Visual Check**: Sliders should have values from backend
5. Cancel modal

**Expected**: No errors, sliders populated with backend values

### 3. Test Room Creation with Backend

1. Click "Create Room" again
2. Configure:
   - Player name: "TestPlayer"
   - Room ID: "test123"
   - Number of Players: 2
   - Number of Bots: 2
3. Click "Create Room"
4. **Check Console**: Should see:
   ```
   API Mode: Initializing game with backend...
   Starting game via API...
   Game initialized: {roomCode: "...", gameStatus: "in_progress", ...}
   WebSocket connected to: ws://98.70.41.170:9000/ws/...
   ```
5. **Expected Navigation**: Redirects to `/room/test123`

**Expected**: No errors, successful backend initialization

### 4. Test Room View Loading

After room creation:

1. **Check UI**:
   - No waiting room modal should appear
   - Board should be visible
   - Cards should be in hand
2. **Check Console**:
   ```
   API Mode: Game already initialized from backend
   Loading board from apiGameStore...
   Current turn: {name: "...", isBot: ...}
   ```
3. Click "Start Game" button
4. **Expected**: First player notification appears

**Expected**: Room loads with backend state

### 5. Test Human Move

1. Select a card from your hand (if it's your turn)
2. Click an empty cell on the board
3. **Check Console**:
   ```
   Sending human move via WebSocket: {playerId: "...", x: 2, y: 3, card: 5}
   Move sent successfully
   ```
4. **Check Network**: WebSocket frame should show `human_move` action
5. **Expected Response**: Backend sends `move-made` event

**Expected**: Move sent to backend, no errors

### 6. Test Bot Move

If bot is first player or after your move:

1. Wait for bot's turn
2. **Check Console**:
   ```
   Current player is bot, triggering bot move...
   Sending bot move request via WebSocket
   ```
3. **Expected**: Backend processes bot move and sends `move-made` event

**Expected**: Bot move happens automatically

### 7. Test Game End

Play until someone wins:

1. **Check Console** when game ends:
   ```
   Game ended: {winner: "...", winType: "..."}
   ```
2. **Expected**: Win dialog appears

**Expected**: Game end detected and displayed

## Debugging Common Issues

### Issue: "Cannot connect to backend"

**Check:**
```bash
# Test backend is up
curl http://98.70.41.170:9000/api/config/weights/default

# Check CORS if browser shows CORS error
# Backend should have CORS enabled for your origin
```

**Solution**: 
- Verify backend is running
- Check backend CORS configuration
- Verify `.env` URLs are correct

### Issue: "WebSocket connection failed"

**Check Console**:
```
WebSocket connection error: ...
Attempting reconnection (1/5)...
```

**Solution**:
- Verify WebSocket URL: `ws://98.70.41.170:9000/ws/{roomCode}`
- Check if backend WebSocket server is running
- Verify room code is correct

### Issue: "Heuristic sliders don't load"

**Check Console**:
```
Failed to load backend defaults: ...
```

**Solution**:
- Backend `/api/config/weights/default` endpoint might be down
- Check network tab for failed request
- Verify backend response format matches `BackendWeights` interface

### Issue: "Moves not registering"

**Check:**
1. Console for WebSocket send logs
2. Network tab for WebSocket frames
3. Backend logs for move validation

**Possible Causes**:
- WebSocket not connected
- Invalid move (backend rejected)
- Backend not responding

**Solution**:
- Check `apiGameStore.makeMove()` is being called
- Verify WebSocket is connected (`wsService.isConnected`)
- Check backend logs for errors

### Issue: "Bot doesn't move automatically"

**Check Console**:
```
Current player: {id: "...", name: "Bot1", isBot: true}
Auto-triggering bot move...
```

**Solution**:
- Verify `apiGameStore.currentPlayer.isBot === true`
- Check WebSocket is connected
- Backend should handle bot moves server-side

## Manual WebSocket Testing

Use browser DevTools to inspect WebSocket messages:

1. Open DevTools → Network → WS tab
2. Find WebSocket connection to `ws://98.70.41.170:9000/ws/...`
3. Click on it to see frames

**Expected Frames:**

**Sent (human_move):**
```json
{
  "action": "human_move",
  "playerId": "player1",
  "x": 2,
  "y": 3,
  "card": 5
}
```

**Sent (bot_move):**
```json
{
  "action": "bot_move",
  "roomCode": "test123"
}
```

**Received (move-made):**
```json
{
  "event": "move-made",
  "playerId": "...",
  "x": 2,
  "y": 3,
  "card": 5,
  "newBoard": [[...]],
  "nextTurnIndex": 1
}
```

**Received (game-end):**
```json
{
  "event": "game-end",
  "winner": "player1",
  "winType": "row",
  "winningCards": [...]
}
```

## API Request Testing

Test backend endpoints manually:

### GET Default Heuristics

```bash
curl http://98.70.41.170:9000/api/config/weights/default
```

**Expected Response:**
```json
{
  "legal_move": 30,
  "w_win": 10000,
  "w_threat": 200,
  "w_threat_value": 60,
  ...
}
```

### POST Start Game

```bash
curl -X POST http://98.70.41.170:9000/api/play \
  -H "Content-Type: application/json" \
  -d '{
    "room_code": "test123",
    "players": [
      {"id": "p1", "name": "Player1", "is_bot": false},
      {"id": "p2", "name": "Bot1", "is_bot": true}
    ],
    "heuristic_weights": {
      "legal_move": 30,
      "w_win": 10000,
      ...
    }
  }'
```

**Expected Response:**
```json
{
  "room_code": "test123",
  "game_status": "in_progress",
  "board": [[...]],
  "turn_order": [...]
}
```

## Checklist

Use this checklist for complete testing:

### Backend Connectivity
- [ ] Backend reachable via curl
- [ ] GET /api/config/weights/default returns data
- [ ] POST /api/play accepts requests
- [ ] WebSocket connection works

### Demo Mode
- [ ] Demo mode still works unchanged
- [ ] Can create rooms
- [ ] Can play games
- [ ] Bot AI works
- [ ] Win detection works

### API Mode - Setup
- [ ] Can switch to API mode in settings
- [ ] Mode persists after refresh
- [ ] Backend defaults load in Create Room modal
- [ ] Room creation hits backend API
- [ ] WebSocket connects after room creation

### API Mode - Gameplay
- [ ] Room view loads with backend state
- [ ] No waiting room modal in API mode
- [ ] First player notification shows
- [ ] Can select and place cards
- [ ] Human moves sent via WebSocket
- [ ] Board updates after moves
- [ ] Bot moves trigger automatically
- [ ] Game end detection works
- [ ] Win dialog displays

### Error Handling
- [ ] Backend connection errors shown
- [ ] WebSocket reconnection works
- [ ] Invalid moves show errors
- [ ] Timeout errors handled gracefully

## Test Scenarios

### Scenario 1: Full API Mode Game (2 Humans)
1. Player A creates room in API mode
2. Player B joins room (if backend supports it)
3. Both players take turns
4. Game completes successfully

### Scenario 2: Human vs Bot
1. Create room: 1 human, 1 bot
2. Human makes first move
3. Bot responds automatically
4. Continue until win

### Scenario 3: All Bots (Spectator)
1. Create room: 0 humans, 4 bots
2. Watch bots play automatically
3. Game should complete without intervention

### Scenario 4: Network Interruption
1. Start game in API mode
2. Disable network
3. Try to make a move
4. Re-enable network
5. Verify reconnection and state sync

### Scenario 5: Mode Switching
1. Create room in demo mode → play game → complete
2. Switch to API mode in settings
3. Create new room → play game → complete
4. Switch back to demo mode
5. Verify demo mode still works

## Success Criteria

API Mode is fully functional when:
- ✅ Backend connectivity works reliably
- ✅ Room creation initializes game server-side
- ✅ Human moves sent and acknowledged
- ✅ Bot moves trigger and process automatically
- ✅ Board state syncs correctly
- ✅ Game end detected and displayed
- ✅ Errors handled gracefully
- ✅ Demo mode unaffected
- ✅ Can switch modes without issues

## Next Steps After Testing

Once basic functionality works:

1. **Polish WebSocket Handlers**: Add proper state updates on move-made
2. **Improve Error Messages**: User-friendly error notifications
3. **Add Loading States**: Show when waiting for backend/bot
4. **Performance**: Optimize WebSocket message handling
5. **Edge Cases**: Handle disconnects, timeouts, invalid states

---

**Happy Testing! 🧪**
