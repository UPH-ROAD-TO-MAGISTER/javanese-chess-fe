import { useSocketStore } from '@/stores/socket'
import { useGameStore } from '@/stores/game'
import type {
  CreateRoomPayload,
  JoinRoomPayload,
  PlayerMovePayload,
  MoveSuccessPayload,
  GameOverPayload,
  SocketResponse,
} from '@/types/socket'
import { SocketEvent } from '@/types/socket'
import type { Player, Board } from '@/types/game'

export class SocketService {
  private socketStore = useSocketStore()
  private gameStore = useGameStore()

  /**
   * Initialize socket connection
   */
  connect() {
    this.socketStore.connect()
    this.setupEventListeners()
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    this.socketStore.disconnect()
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners() {
    // Room events
    this.socketStore.on<SocketResponse<{ roomCode: string }>>(
      SocketEvent.ROOM_CREATED,
      this.handleRoomCreated.bind(this),
    )

    this.socketStore.on<SocketResponse<{ roomCode: string; players: Player[] }>>(
      SocketEvent.ROOM_JOINED,
      this.handleRoomJoined.bind(this),
    )

    this.socketStore.on<{ player: Player }>(
      SocketEvent.PLAYER_JOINED,
      this.handlePlayerJoined.bind(this),
    )

    // Game events
    this.socketStore.on<{ players: Player[] }>(
      SocketEvent.GAME_STARTED,
      this.handleGameStarted.bind(this),
    )

    this.socketStore.on<MoveSuccessPayload>(
      SocketEvent.MOVE_SUCCESS,
      this.handleMoveSuccess.bind(this),
    )

    this.socketStore.on<{ error: string }>(
      SocketEvent.MOVE_INVALID,
      this.handleMoveInvalid.bind(this),
    )

    this.socketStore.on<GameOverPayload>(SocketEvent.GAME_OVER, this.handleGameOver.bind(this))
  }

  /**
   * Create a new room
   */
  createRoom(payload: CreateRoomPayload) {
    this.socketStore.emit(SocketEvent.CREATE_ROOM, payload)
  }

  /**
   * Join an existing room
   */
  joinRoom(payload: JoinRoomPayload) {
    this.socketStore.emit(SocketEvent.JOIN_ROOM, payload)
  }

  /**
   * Leave current room
   */
  leaveRoom(roomCode: string) {
    this.socketStore.emit(SocketEvent.LEAVE_ROOM, { roomCode })
  }

  /**
   * Start the game
   */
  startGame(roomCode: string) {
    this.socketStore.emit(SocketEvent.START_GAME, { roomCode })
  }

  /**
   * Send player move
   */
  sendMove(payload: PlayerMovePayload) {
    this.socketStore.emit(SocketEvent.PLAYER_MOVE, payload)
  }

  /**
   * Event Handlers
   */
  private handleRoomCreated(response: SocketResponse<{ roomCode: string }>) {
    if (response.success && response.data) {
      console.log('Room created:', response.data.roomCode)
      this.gameStore.roomCode = response.data.roomCode
    }
  }

  private handleRoomJoined(response: SocketResponse<{ roomCode: string; players: Player[] }>) {
    if (response.success && response.data) {
      console.log('Joined room:', response.data.roomCode)
      this.gameStore.roomCode = response.data.roomCode
      this.gameStore.players = response.data.players
    }
  }

  private handlePlayerJoined(data: { player: Player }) {
    console.log('Player joined:', data.player.name)
    // Add player to game store if not exists
    const exists = this.gameStore.players.some((p) => p.id === data.player.id)
    if (!exists) {
      this.gameStore.players.push(data.player)
    }
  }

  private handleGameStarted(data: { players: Player[] }) {
    console.log('Game started with players:', data.players)
    this.gameStore.initGame(this.gameStore.roomCode, data.players)
  }

  private handleMoveSuccess(data: MoveSuccessPayload) {
    console.log('Move success:', data)
    // Update board with new state
    this.gameStore.updateBoard(data.updatedBoard as Board)
    // Move to next player
    this.gameStore.nextTurn()
  }

  private handleMoveInvalid(data: { error: string }) {
    console.error('Invalid move:', data.error)
    // Could show a toast notification here
  }

  private handleGameOver(data: GameOverPayload) {
    console.log('Game over:', data)
    this.gameStore.setWinner(data.winnerId, data.winCondition)
  }
}

// Export singleton instance
export const socketService = new SocketService()
