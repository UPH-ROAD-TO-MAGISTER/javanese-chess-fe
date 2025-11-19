/**
 * API Game Store - Handles game state when connected to backend
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlayGameResponse, TurnOrderPlayer, BoardCell } from '@/types/api'
import type { HeuristicWeights } from '@/types/game'
import { apiService } from '@/services/api'
import { wsService } from '@/services/websocket'

export const useApiGameStore = defineStore('apiGame', () => {
  // Game state from backend
  const roomCode = ref<string>('')
  const gameStatus = ref<'waiting' | 'playing' | 'finished'>('waiting')
  const board = ref<BoardCell[][]>([])
  const turnOrder = ref<TurnOrderPlayer[]>([])
  const currentTurnIndex = ref(0)
  const myPlayerId = ref<string>('')
  const isConnected = ref(false)

  // Game end state
  const winner = ref<{
    id: string
    name: string
    isBot: boolean
    color?: string
    cardsInHand?: number[]
  } | null>(null)
  const winType = ref<'horizontal' | 'vertical' | 'diagonal' | 'draw' | null>(null)
  const winningPositions = ref<Array<{ x: number; y: number }>>([])

  // Error state
  const lastError = ref<string>('')

  // Track if joining is in progress
  const isJoiningLobby = ref(false)

  // Multiplayer lobby state
  const lobbyPlayers = ref<string[]>([]) // List of player names in lobby
  const lobbyStatus = ref<'lobby' | 'starting' | 'playing'>('lobby')

  // Move counter to track if this is first move
  const moveCount = ref(0)

  // Track if game just started (to skip first bot auto-trigger)
  const isGameJustStarted = ref(true)

  // Track last processed move to avoid duplicates
  const lastProcessedMove = ref<string | null>(null)

  // Last move notification
  const lastMove = ref<{
    playerName: string
    playerId: string
    x: number
    y: number
    card: number
    wasReplacement: boolean
    replacedValue?: number
  } | null>(null)

  // Computed
  const currentPlayer = computed(() => {
    if (turnOrder.value.length === 0) return null
    return turnOrder.value[currentTurnIndex.value]
  })

  const myPlayer = computed(() => {
    return turnOrder.value.find((p) => p.id === myPlayerId.value) || null
  })

  const isMyTurn = computed(() => {
    return currentPlayer.value?.id === myPlayerId.value
  })

  const myHand = computed(() => {
    return myPlayer.value?.hand || []
  })

  const myDeck = computed(() => {
    return myPlayer.value?.deck || []
  })

  // Actions
  async function initializeGame(config: {
    playerNames: string[] // Array of all player names from lobby
    roomId: string
    numberOfBots: number
    numberOfPlayers: number
    heuristicWeights: HeuristicWeights
  }): Promise<void> {
    try {
      const response: PlayGameResponse = await apiService.startGame({
        playerNames: config.playerNames,
        roomId: config.roomId,
        numberOfBots: config.numberOfBots,
        numberOfPlayers: config.numberOfPlayers,
        heuristicWeights: config.heuristicWeights,
      })

      if (!response.success) {
        throw new Error('Failed to start game')
      }

      // Set game state from backend
      roomCode.value = response.data.room_code
      gameStatus.value = response.data.status
      board.value = response.data.board.cells

      // Map players with turn order
      const playersMap = new Map(response.data.players.map((p) => [p.id, p]))
      turnOrder.value = response.data.turn_order.map((id) => playersMap.get(id)!).filter(Boolean)

      // Find my player ID (first non-bot player)
      const humanPlayer = response.data.players.find((p) => !p.isBot)
      if (humanPlayer) {
        myPlayerId.value = humanPlayer.id
      }

      currentTurnIndex.value = 0

      // Save state to localStorage for refresh recovery
      saveStateToStorage()

      // Connect to WebSocket with room code (in-game WebSocket)
      await wsService.connect(roomCode.value)
      isConnected.value = true

      // Setup WebSocket listeners
      setupWebSocketListeners()

      console.log('Game initialized:', {
        roomCode: roomCode.value,
        status: gameStatus.value,
        players: turnOrder.value.length,
        myId: myPlayerId.value,
      })
    } catch (error) {
      console.error('Failed to initialize game:', error)
      throw error
    }
  }

  // Save state to localStorage
  function saveStateToStorage() {
    const state = {
      roomCode: roomCode.value,
      gameStatus: gameStatus.value,
      board: board.value,
      turnOrder: turnOrder.value,
      currentTurnIndex: currentTurnIndex.value,
      myPlayerId: myPlayerId.value,
      timestamp: Date.now(),
    }
    localStorage.setItem('apiGameState', JSON.stringify(state))
  }

  // Restore state from localStorage
  function restoreStateFromStorage(): boolean {
    try {
      const savedState = localStorage.getItem('apiGameState')
      if (!savedState) return false

      const state = JSON.parse(savedState)

      // Check if state is not too old (e.g., 1 hour)
      const oneHour = 60 * 60 * 1000
      if (Date.now() - state.timestamp > oneHour) {
        console.log('Saved state is too old, clearing...')
        localStorage.removeItem('apiGameState')
        return false
      }

      // Restore state
      roomCode.value = state.roomCode
      gameStatus.value = state.gameStatus
      board.value = state.board
      turnOrder.value = state.turnOrder
      currentTurnIndex.value = state.currentTurnIndex
      myPlayerId.value = state.myPlayerId

      console.log('State restored from localStorage:', {
        roomCode: roomCode.value,
        players: turnOrder.value.length,
        myId: myPlayerId.value,
      })

      return true
    } catch (error) {
      console.error('Failed to restore state:', error)
      localStorage.removeItem('apiGameState')
      return false
    }
  }

  // Reconnect WebSocket after refresh
  async function reconnectWebSocket(): Promise<void> {
    if (!roomCode.value) {
      throw new Error('No room code to reconnect')
    }

    try {
      await wsService.connect(roomCode.value)
      isConnected.value = true
      setupWebSocketListeners()
      console.log('WebSocket reconnected to room:', roomCode.value)
    } catch (error) {
      console.error('Failed to reconnect WebSocket:', error)
      throw error
    }
  }

  function setupWebSocketListeners() {
    console.log('🔧 Setting up WebSocket listeners...')

    // Listen for room_created confirmation
    wsService.on('room_created', handleRoomCreated)
    console.log('✅ Registered listener: room_created')

    // Listen for new_player_joined
    wsService.on('new_player_joined', handleNewPlayerJoined)
    console.log('✅ Registered listener: new_player_joined')

    // Listen for game_started
    wsService.on('game_started', (data: unknown) => {
      console.log('🎮 RAW game_started event received:', data)
      handleGameStarted(data as Record<string, unknown>)
    })
    console.log('✅ Registered listener: game_started')

    // Listen for move events (actual backend event)
    wsService.on('move', handleMoveEvent)
    console.log('✅ Registered listener: move')

    // Listen for bot_move events
    wsService.on('bot_move', handleMoveEvent)
    console.log('✅ Registered listener: bot_move')

    // Listen for game_over events
    wsService.on('game_over', handleGameOver)
    console.log('✅ Registered listener: game_over')

    // Listen for state updates (if backend sends this)
    wsService.on('state-updated', handleStateUpdated)
    console.log('✅ Registered listener: state-updated')

    // Listen for game end
    wsService.on('game_end', handleGameEnd)
    console.log('✅ Registered listener: game_end')

    // Listen for errors
    wsService.on('error', handleError)
    console.log('✅ Registered listener: error')

    // Listen for disconnect
    wsService.on('disconnect', handleDisconnect)
    console.log('✅ Registered listener: disconnect')
  }

  function handleRoomCreated(data: Record<string, unknown>) {
    console.log('🏠 Room created confirmation received:', data)

    try {
      const responseData = data.data as Record<string, unknown>

      if (responseData.status === 'lobby') {
        lobbyStatus.value = 'lobby'
        console.log('✅ Room created successfully, status: lobby')
      }
    } catch (error) {
      console.error('Error handling room_created event:', error)
    }
  }

  function handleNewPlayerJoined(data: Record<string, unknown>) {
    console.log('👤 New player joined:', data)

    try {
      const responseData = data.data as Record<string, unknown>
      const playerName = responseData.player_name as string

      if (playerName && !lobbyPlayers.value.includes(playerName)) {
        lobbyPlayers.value.push(playerName)
        console.log('✅ Player added to lobby:', playerName)
        console.log('📋 Current lobby players:', lobbyPlayers.value)
      }
    } catch (error) {
      console.error('Error handling new_player_joined event:', error)
    }
  }

  function handleGameStarted(data: Record<string, unknown>) {
    console.log('🎮 Game started event received:', data)

    try {
      const gameData = data.data as Record<string, unknown>

      console.log('📊 State BEFORE update:', {
        gameStatus: gameStatus.value,
        myPlayerId: myPlayerId.value,
        hasPlayers: turnOrder.value.length,
      })

      // Update game status
      lobbyStatus.value = 'playing'
      gameStatus.value = 'playing'

      console.log('📊 State AFTER status change:', {
        gameStatus: gameStatus.value,
        lobbyStatus: lobbyStatus.value,
      })

      // Update board
      if (gameData.board && typeof gameData.board === 'object') {
        const boardData = gameData.board as { cells: BoardCell[][] }
        board.value = boardData.cells
        console.log('✅ Board initialized from game_started')
      }

      // Update players
      if (Array.isArray(gameData.players)) {
        const playersMap = new Map(gameData.players.map((p: TurnOrderPlayer) => [p.id, p]))
        const turnOrderIds = gameData.turn_order as string[]

        turnOrder.value = turnOrderIds.map((id) => playersMap.get(id)!).filter(Boolean)
        console.log('✅ Players initialized:', turnOrder.value.length)

        // Find my player ID if not already set (for guests)
        if (!myPlayerId.value) {
          const myName = localStorage.getItem('playerName')
          console.log('🔍 Looking for player with name:', myName)
          
          const myPlayer = turnOrder.value.find((p) => p.name === myName && !p.isBot)
          if (myPlayer) {
            myPlayerId.value = myPlayer.id
            console.log('✅ My player ID found:', myPlayerId.value)
          } else {
            console.error('❌ My player NOT found!')
            console.log('Available players:', turnOrder.value.map((p) => p.name))
          }
        }
      }

      // Set room code
      if (typeof gameData.room_code === 'string') {
        roomCode.value = gameData.room_code
        console.log('✅ Room code set:', roomCode.value)
      }

      // Set current turn index
      currentTurnIndex.value = 0

      console.log('✅ Game started successfully!')
      console.log('📋 Final Game State:', {
        roomCode: roomCode.value,
        players: turnOrder.value.length,
        myId: myPlayerId.value,
        currentPlayer: currentPlayer.value?.name,
      })

      // Save state
      saveStateToStorage()
    } catch (error) {
      console.error('Error handling game_started event:', error)
    }
  }

  function handleStateUpdated(data: Record<string, unknown>) {
    console.log('State updated event received:', data)

    try {
      // Extract room data from response
      const responseData = data.data as Record<string, unknown>
      const roomData = responseData?.room as Record<string, unknown>

      if (!roomData) {
        console.error('No room data in state-updated event')
        return
      }

      // Update board
      if (roomData.board && typeof roomData.board === 'object') {
        const boardData = roomData.board as { cells: BoardCell[][] }
        board.value = boardData.cells
        console.log('Board updated from WebSocket')
      }

      // Update turn index
      if (typeof roomData.turn_idx === 'number') {
        currentTurnIndex.value = roomData.turn_idx
        console.log('Turn index updated to:', currentTurnIndex.value)
      }

      // Update players (hands updated from backend)
      if (Array.isArray(roomData.players)) {
        const playersMap = new Map(roomData.players.map((p: TurnOrderPlayer) => [p.id, p]))
        const turnOrderIds = roomData.turn_order as string[]

        turnOrder.value = turnOrderIds.map((id) => playersMap.get(id)!).filter(Boolean)
        console.log('Players updated:', turnOrder.value.length)
      }

      // Check for game end
      if (roomData.winner_id && typeof roomData.winner_id === 'string') {
        gameStatus.value = 'finished'
        const winnerPlayer = turnOrder.value.find((p) => p.id === roomData.winner_id)
        if (winnerPlayer) {
          winner.value = {
            id: winnerPlayer.id,
            name: winnerPlayer.name,
            isBot: winnerPlayer.isBot,
          }
          console.log('Game ended, winner:', winner.value.name)
        }
      } else if (roomData.draw === true) {
        gameStatus.value = 'finished'
        winType.value = 'draw'
        console.log('Game ended in draw')
      }

      // Auto-trigger bot if next player is bot
      if (currentPlayer.value?.isBot && gameStatus.value === 'playing') {
        console.log('Next player is bot, triggering bot move...')
        setTimeout(() => {
          wsService.sendBotMove(roomCode.value)
        }, 1500)
      }

      // Save state after each update
      saveStateToStorage()
    } catch (error) {
      console.error('Error handling state-updated event:', error)
    }
  }

  function handleMoveEvent(data: Record<string, unknown>) {
    console.log('📥 Move event received:', data)

    try {
      const moveData = data.data as Record<string, unknown>

      // Get move details for deduplication
      const playerId = moveData.playerID || moveData.player_id || moveData.bot_id
      const x = moveData.x
      const y = moveData.y
      const playedCard = moveData.card

      // Create unique move signature to avoid processing duplicates
      // Backend sends both 'move' and 'bot_move' events for same bot move
      const moveSignature = `${playerId}-${x}-${y}-${playedCard}`

      if (lastProcessedMove.value === moveSignature) {
        console.log('⏭️ SKIPPING duplicate move event:', moveSignature)
        return
      }

      console.log('✅ Processing unique move:', moveSignature)
      lastProcessedMove.value = moveSignature

      // Increment move counter
      moveCount.value++
      console.log(`📊 Move count: ${moveCount.value}`)

      // Check if this was a replacement (card already existed)
      let wasReplacement = false
      let replacedValue: number | undefined

      if (typeof x === 'number' && typeof y === 'number') {
        const oldCell = board.value[y]?.[x]
        if (oldCell && oldCell.value > 0 && oldCell.value !== playedCard) {
          wasReplacement = true
          replacedValue = oldCell.value
        }
      }

      // Update board from move data
      if (moveData.board && typeof moveData.board === 'object') {
        const boardData = moveData.board as { cells: BoardCell[][] }
        board.value = boardData.cells
        console.log('✅ Board updated from move event')
      }

      // Update players (hands and decks) from backend - PREFERRED METHOD
      if (Array.isArray(moveData.players)) {
        console.log('🔄 Updating all players from backend (full players array)...')
        const playersMap = new Map(moveData.players.map((p: TurnOrderPlayer) => [p.id, p]))

        // Update each player in turnOrder with fresh data from backend
        turnOrder.value = turnOrder.value.map((player) => {
          const updatedPlayer = playersMap.get(player.id)
          if (updatedPlayer) {
            console.log(
              `✅ Updated ${updatedPlayer.name}: hand=${updatedPlayer.hand.length}, deck=${updatedPlayer.deck.length}`,
            )
            return updatedPlayer
          }
          return player
        })
      }
      // FALLBACK: Manual update if backend doesn't send full players array
      else {
        console.log('⚠️ Backend did not send players array, using manual hand update...')

        const drawnCard = moveData.drawnCard || moveData.drawn_card

        if (playerId && typeof playerId === 'string') {
          const playerIndex = turnOrder.value.findIndex((p) => p.id === playerId)
          if (playerIndex !== -1) {
            const player = turnOrder.value[playerIndex]

            if (player) {
              // Remove played card from hand
              if (typeof playedCard === 'number') {
                const cardIndex = player.hand.indexOf(playedCard)
                if (cardIndex !== -1) {
                  player.hand.splice(cardIndex, 1)
                  console.log(
                    `✅ Removed card ${playedCard} from ${player.name} hand (${player.hand.length} cards left)`,
                  )
                } else {
                  console.warn(
                    `⚠️ Card ${playedCard} not found in ${player.name} hand:`,
                    player.hand,
                  )
                }
              }

              // Add drawn card from backend (if provided)
              // Backend sends drawnCard for the card that was drawn from deck
              if (typeof drawnCard === 'number' && drawnCard > 0) {
                player.hand.push(drawnCard)
                console.log(
                  `🎴 Added drawnCard ${drawnCard} to ${player.name} hand (now ${player.hand.length} cards)`,
                )
              } else if (drawnCard === 0) {
                console.log(`ℹ️ No card drawn (deck might be empty or hand already full)`)
              } else {
                console.warn(`⚠️ No drawnCard provided by backend`)
              }

              // Log final hand state
              console.log(
                `📋 ${player.name} final hand:`,
                player.hand,
                `(${player.hand.length} cards)`,
              )
            }
          }
        }
      }

      // Store last move for notification
      if (
        playerId &&
        typeof playerId === 'string' &&
        typeof x === 'number' &&
        typeof y === 'number' &&
        typeof playedCard === 'number'
      ) {
        const player = turnOrder.value.find((p) => p.id === playerId)
        if (player) {
          lastMove.value = {
            playerName: player.name,
            playerId: player.id,
            x,
            y,
            card: playedCard,
            wasReplacement,
            replacedValue,
          }
          console.log('📍 Last move recorded:', lastMove.value)

          // Clear notification after 3 seconds
          setTimeout(() => {
            lastMove.value = null
          }, 3000)
        }
      }

      // Get next turn player ID
      // Backend sends different fields for move vs bot_move events
      let nextTurnId = moveData.nextTurn || moveData.next_turn

      // If no nextTurn provided (common in bot_move events), calculate it
      if (!nextTurnId) {
        console.log('⚠️ No nextTurn in response, calculating from playerID...')
        const currentPlayerId = playerId as string
        const currentPlayerIndex = turnOrder.value.findIndex((p) => p.id === currentPlayerId)
        if (currentPlayerIndex !== -1) {
          const nextIndex = (currentPlayerIndex + 1) % turnOrder.value.length
          nextTurnId = turnOrder.value[nextIndex]?.id
          console.log(
            `🔧 Calculated nextTurn: index ${currentPlayerIndex} → ${nextIndex} (${turnOrder.value[nextIndex]?.name})`,
          )
        }
      }

      console.log('🎯 nextTurnId from backend:', nextTurnId)
      console.log(
        '📋 Current turn order:',
        turnOrder.value.map((p, i) => `${i}: ${p.name} (${p.id.substring(0, 8)}...)`),
      )
      console.log(
        '📍 Current turn index BEFORE update:',
        currentTurnIndex.value,
        '→',
        turnOrder.value[currentTurnIndex.value]?.name,
      )

      if (nextTurnId && typeof nextTurnId === 'string') {
        // Find the index of next player
        const nextIndex = turnOrder.value.findIndex((p) => p.id === nextTurnId)
        console.log('🔍 Looking for player with ID:', nextTurnId, '→ found at index:', nextIndex)

        if (nextIndex !== -1) {
          const nextPlayer = turnOrder.value[nextIndex]

          // VALIDATION: Check if backend is skipping human player
          const expectedNextIndex = (currentTurnIndex.value + 1) % turnOrder.value.length
          if (nextIndex !== expectedNextIndex) {
            console.warn('⚠️ Backend nextTurn does not match expected rotation!')
            console.warn(
              '   Expected index:',
              expectedNextIndex,
              '→',
              turnOrder.value[expectedNextIndex]?.name,
            )
            console.warn('   Backend sent:', nextIndex, '→', nextPlayer?.name)
            console.warn('   🔧 Following backend instruction anyway...')
          }

          currentTurnIndex.value = nextIndex
          if (nextPlayer) {
            console.log(
              '✅ Turn updated to:',
              nextPlayer.name,
              '(isBot:',
              nextPlayer.isBot,
              ') at index:',
              nextIndex,
            )
          }
        } else {
          console.error('❌ Could not find player with nextTurn ID:', nextTurnId)
          console.log(
            '📋 Available players:',
            turnOrder.value.map((p) => ({ id: p.id, name: p.name })),
          )

          // FALLBACK: Use round-robin if backend nextTurn is invalid
          console.warn('🔧 Using round-robin fallback...')
          currentTurnIndex.value = (currentTurnIndex.value + 1) % turnOrder.value.length
          console.log(
            '✅ Turn moved to index:',
            currentTurnIndex.value,
            '→',
            turnOrder.value[currentTurnIndex.value]?.name,
          )
        }
      } else {
        console.warn('⚠️ No nextTurn provided in move event')
        // FALLBACK: Use round-robin
        console.warn('🔧 Using round-robin fallback...')
        currentTurnIndex.value = (currentTurnIndex.value + 1) % turnOrder.value.length
        console.log(
          '✅ Turn moved to index:',
          currentTurnIndex.value,
          '→',
          turnOrder.value[currentTurnIndex.value]?.name,
        )
      }

      // Check if next player is bot and auto-trigger
      console.log('🤖 Checking if should auto-trigger bot...')
      console.log('   - currentPlayer:', currentPlayer.value?.name)
      console.log('   - isBot:', currentPlayer.value?.isBot)
      console.log('   - gameStatus:', gameStatus.value)
      console.log('   - moveCount:', moveCount.value)
      console.log('   - isGameJustStarted:', isGameJustStarted.value)

      // DON'T trigger bot only on very first move of the game - backend handles it automatically
      // After first move is processed, we need to trigger all subsequent bot moves
      if (isGameJustStarted.value && currentPlayer.value?.isBot) {
        console.log('⏸️ Skipping bot trigger - game just started, backend auto-handles first bot')
        isGameJustStarted.value = false // After first move, we handle bot triggers
      } else if (currentPlayer.value?.isBot && gameStatus.value === 'playing') {
        console.log('✅ Next player is bot, auto-triggering in 1.5s...')
        setTimeout(() => {
          console.log('⏰ Triggering bot move now for room:', roomCode.value)
          wsService.sendBotMove(roomCode.value)
        }, 1500)
      } else {
        console.log('⏸️ Not triggering bot:', {
          isBot: currentPlayer.value?.isBot,
          status: gameStatus.value,
        })
      }

      // Save state after each update
      saveStateToStorage()
    } catch (error) {
      console.error('Error handling move event:', error)
    }
  }

  function handleGameEnd(data: Record<string, unknown>) {
    console.log('Game ended event received:', data)

    try {
      const responseData = data.data as Record<string, unknown>

      gameStatus.value = 'finished'

      // Extract winner info
      if (responseData && responseData.winner && typeof responseData.winner === 'object') {
        const winnerData = responseData.winner as { id: string; name: string; isBot: boolean }
        winner.value = winnerData
        console.log('Winner:', winnerData.name)
      }

      // Extract win type
      if (responseData && typeof responseData.win_type === 'string') {
        winType.value = responseData.win_type as 'horizontal' | 'vertical' | 'diagonal' | 'draw'
      }

      // Extract winning positions
      if (responseData && Array.isArray(responseData.winning_positions)) {
        winningPositions.value = responseData.winning_positions as Array<{ x: number; y: number }>
      }
    } catch (error) {
      console.error('Error handling game_end event:', error)
    }
  }

  function handleGameOver(data: Record<string, unknown>) {
    console.log('🏆 Game over event received:', data)

    try {
      const gameData = data.data as Record<string, unknown>

      // Update board with final state
      if (gameData.board && typeof gameData.board === 'object') {
        const boardData = gameData.board as { cells: BoardCell[][] }
        board.value = boardData.cells
        console.log('✅ Final board state updated')
      }

      // Get winner ID first
      const winnerId = gameData.winner
      if (winnerId && typeof winnerId === 'string') {
        const winnerPlayer = turnOrder.value.find((p) => p.id === winnerId)
        if (winnerPlayer) {
          winner.value = {
            id: winnerPlayer.id,
            name: winnerPlayer.name,
            isBot: winnerPlayer.isBot,
            color: winnerPlayer.color,
            cardsInHand: winnerPlayer.hand,
          }
          console.log('🏆 Winner:', winnerPlayer.name)
        }
      }

      // Try to detect winning positions (4-in-a-row)
      const winPositions = findWinningPositions()
      if (winPositions.length > 0) {
        winningPositions.value = winPositions

        // Determine win type from positions
        if (winPositions.length === 4) {
          const [p1, p2, p3, p4] = winPositions
          if (p1 && p2 && p3 && p4) {
            // Check horizontal (same y)
            if (p1.y === p2.y && p2.y === p3.y && p3.y === p4.y) {
              winType.value = 'horizontal'
            }
            // Check vertical (same x)
            else if (p1.x === p2.x && p2.x === p3.x && p3.x === p4.x) {
              winType.value = 'vertical'
            }
            // Otherwise diagonal
            else {
              winType.value = 'diagonal'
            }
          }
        }

        console.log('� Winning positions found:', winPositions)
        console.log('🎯 Win type:', winType.value)
      }

      // Set game status to finished immediately (watcher will handle modal delay)
      gameStatus.value = 'finished'

      // Save final state
      saveStateToStorage()
    } catch (error) {
      console.error('Error handling game_over event:', error)
    }
  }

  // Helper function to find 4-in-a-row winning positions
  function findWinningPositions(): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = []

    // Check all directions from each cell
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = board.value[y]?.[x]
        if (!cell || cell.value === 0) continue

        const ownerId = cell.ownerId
        if (!ownerId) continue

        // Check horizontal
        if (x <= 5) {
          let count = 0
          const tempPositions: Array<{ x: number; y: number }> = []
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y]?.[x + i]
            if (checkCell && checkCell.ownerId === ownerId && checkCell.value > 0) {
              count++
              tempPositions.push({ x: x + i, y })
            }
          }
          if (count === 4) return tempPositions
        }

        // Check vertical
        if (y <= 5) {
          let count = 0
          const tempPositions: Array<{ x: number; y: number }> = []
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y + i]?.[x]
            if (checkCell && checkCell.ownerId === ownerId && checkCell.value > 0) {
              count++
              tempPositions.push({ x, y: y + i })
            }
          }
          if (count === 4) return tempPositions
        }

        // Check diagonal (top-left to bottom-right)
        if (x <= 5 && y <= 5) {
          let count = 0
          const tempPositions: Array<{ x: number; y: number }> = []
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y + i]?.[x + i]
            if (checkCell && checkCell.ownerId === ownerId && checkCell.value > 0) {
              count++
              tempPositions.push({ x: x + i, y: y + i })
            }
          }
          if (count === 4) return tempPositions
        }

        // Check diagonal (top-right to bottom-left)
        if (x >= 3 && y <= 5) {
          let count = 0
          const tempPositions: Array<{ x: number; y: number }> = []
          for (let i = 0; i < 4; i++) {
            const checkCell = board.value[y + i]?.[x - i]
            if (checkCell && checkCell.ownerId === ownerId && checkCell.value > 0) {
              count++
              tempPositions.push({ x: x - i, y: y + i })
            }
          }
          if (count === 4) return tempPositions
        }
      }
    }

    return positions
  }

  function handleError(data: Record<string, unknown>) {
    console.error('WebSocket error event received:', data)

    try {
      const responseData = data.data as Record<string, unknown>

      if (responseData && typeof responseData.message === 'string') {
        lastError.value = responseData.message
        console.error('Error from server:', responseData.message)
      }
    } catch (error) {
      console.error('Error handling error event:', error)
    }
  }

  function handleDisconnect() {
    console.log('Disconnected from server')
    isConnected.value = false
    // TODO: Show reconnecting notification
  }

  function makeMove(x: number, y: number, card: number) {
    console.log('🎯 makeMove called:', { x, y, card, myId: myPlayerId.value })

    if (!isMyTurn.value) {
      console.warn('❌ Not your turn!')
      return
    }

    if (!isConnected.value) {
      console.warn('❌ Not connected to server!')
      return
    }

    console.log('✅ Sending human move to backend...')
    // Send move to backend - backend will send authoritative state back
    wsService.sendHumanMove(myPlayerId.value, x, y, card)

    // Note: We do optimistic update in the UI layer (RoomView)
    // Backend will send 'move' event with:
    // - Updated board (authoritative)
    // - Drawn card to add to hand
    // - Next turn player
  }

  function getPlayerById(id: string) {
    return turnOrder.value.find((p) => p.id === id)
  }

  function getPlayerName(id: string) {
    return getPlayerById(id)?.name || 'Unknown'
  }

  function getBoardCell(row: number, col: number): BoardCell | null {
    if (row < 0 || row >= 9 || col < 0 || col >= 9) return null
    return board.value[row]?.[col] || null
  }

  function reset() {
    roomCode.value = ''
    gameStatus.value = 'waiting'
    board.value = []
    turnOrder.value = []
    currentTurnIndex.value = 0
    myPlayerId.value = ''
    isConnected.value = false
    winner.value = null
    winType.value = null
    winningPositions.value = []
    lastError.value = ''
    moveCount.value = 0
    isGameJustStarted.value = true
    lastProcessedMove.value = null
    lobbyPlayers.value = []
    lobbyStatus.value = 'lobby'

    // Clear saved state
    localStorage.removeItem('apiGameState')

    // Disconnect WebSocket
    wsService.disconnect()
  }

  // Multiplayer lobby functions
  async function createLobby(roomCode: string, creatorName: string): Promise<void> {
    try {
      // ✅ Connect to WebSocket WITH room_code (so we can receive game_started event)
      console.log('🔌 Connecting to WebSocket with room_code:', roomCode)
      await wsService.connect(roomCode)
      isConnected.value = true

      // Setup listeners
      setupWebSocketListeners()

      // Send room_created event
      wsService.sendRoomCreated(roomCode, creatorName)

      // Initialize lobby state
      lobbyPlayers.value = [creatorName]
      lobbyStatus.value = 'lobby'

      console.log('✅ Lobby created for room:', roomCode)
    } catch (error) {
      console.error('Failed to create lobby:', error)
      throw error
    }
  }

  async function joinLobby(roomCode: string): Promise<void> {
    // ✅ Guard: Prevent double call
    if (isJoiningLobby.value) {
      console.warn('⚠️ Join lobby already in progress, skipping duplicate call')
      return
    }

    try {
      isJoiningLobby.value = true
      const playerName = localStorage.getItem('playerName') || 'Guest'
      
      // ✅ Connect to WebSocket WITH room_code (so we can receive game_started event)
      console.log('🔌 Connecting to WebSocket with room_code:', roomCode)
      await wsService.connect(roomCode)
      isConnected.value = true

      // Setup listeners
      setupWebSocketListeners()
      lobbyStatus.value = 'lobby'
      console.log('✅ WebSocket connected and listeners registered')

      // ✅ THEN call /api/join to notify backend
      console.log('📞 Calling /api/join with:', { roomCode, playerName })
      const response = await apiService.joinRoom(roomCode, playerName)
      console.log('✅ Join room API response:', response)

      // Save player ID from response
      if (response.data?.player_id) {
        myPlayerId.value = response.data.player_id
        localStorage.setItem('playerId', response.data.player_id)
        console.log('✅ Player ID saved:', myPlayerId.value)
      }

      console.log('✅ Joined lobby for room:', roomCode)
    } catch (error) {
      console.error('Failed to join lobby:', error)
      throw error
    } finally {
      isJoiningLobby.value = false
    }
  }

  return {
    // State
    roomCode,
    gameStatus,
    board,
    turnOrder,
    currentTurnIndex,
    myPlayerId,
    isConnected,
    winner,
    winType,
    winningPositions,
    lastError,
    lastMove,
    lobbyPlayers,
    lobbyStatus,

    // Computed
    currentPlayer,
    myPlayer,
    isMyTurn,
    myHand,
    myDeck,

    // Actions
    initializeGame,
    restoreStateFromStorage,
    reconnectWebSocket,
    setupWebSocketListeners,
    createLobby,
    joinLobby,
    makeMove,
    getPlayerById,
    getPlayerName,
    getBoardCell,
    reset,
  }
})
