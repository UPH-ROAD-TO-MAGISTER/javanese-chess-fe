# Javanese Chess - Frontend

🎮 **Strategic card placement game** untuk 2-4 pemain dengan mekanik turn-based yang unik.

Frontend application untuk permainan Catur Jawa, dibangun menggunakan **Vue 3**, **TypeScript**, **Tailwind CSS** dengan tema **Glassmorphism**.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Game Rules](#-game-rules)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Development](#-development)
- [Environment Variables](#-environment-variables)
- [Bot Heuristic Configuration](#-bot-heuristic-configuration)
- [API Integration](#-api-integration)

## ✨ Features

- 🎨 **Glassmorphism UI Design** - Modern dan aesthetic
- 📱 **Responsive Design** - Optimal untuk web & mobile
- 🔌 **Real-time Communication** - WebSocket integration dengan Socket.io
- 🎯 **Drag & Drop Interface** - Intuitive card placement
- ⚙️ **Configurable Settings** - Visual preferences & bot heuristics
- 🤖 **Bot Support** - Play against AI opponents
- 🎭 **Multiple Players** - 2-4 players (including bots)
- ✅ **Valid Move Highlighting** - Visual feedback untuk valid moves
- 🎬 **Smooth Animations** - Card placement animations

## 🛠 Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **WebSocket**: Socket.io Client
- **Drag & Drop**: Vue Draggable Next
- **Package Manager**: Bun

## 🎲 Game Rules

### Board & Setup

- Papan **9x9** grid
- 2-4 pemain (minimal 1 player + 1 bot)
- Setiap pemain: **18 kartu** (angka 1-9, masing-masing 2 buah)
- Kartu dibedakan warna: 🟢 Hijau, 🔴 Merah, 🔵 Biru, 🟣 Ungu
- Pemain hanya pegang **3 kartu** di tangan

### Gameplay

1. **First Move**: Harus di tengah (5,5)
2. **Placement**: Kartu harus adjacent (8 kotak sekitar kartu yang sudah ada)
3. **Override**: Bisa timpa kartu lain jika nilai lebih besar
4. **Turn Order**: Searah jarum jam

### Win Condition

- **Primary**: 4 kartu berurut (horizontal/vertikal/diagonal)
- **Tie Breaker**: Total angka tertinggi dari pola terpanjang

## 📁 Project Structure

```
src/
├── assets/
│   └── styles/
│       └── main.css           # Tailwind + custom styles
├── components/                # Vue components (upcoming)
├── composables/               # Vue composables (upcoming)
├── router/
│   └── index.ts              # Vue Router configuration
├── services/
│   └── socket.service.ts     # Socket.io service layer
├── stores/
│   ├── game.ts               # Game state management
│   ├── settings.ts           # Settings (visual & heuristic)
│   └── socket.ts             # Socket connection state
├── types/
│   ├── game.ts               # Game-related types
│   ├── settings.ts           # Settings types
│   ├── socket.ts             # Socket event types
│   └── index.ts              # Type exports
├── views/
│   ├── HomeView.vue          # Landing page
│   ├── LobbyView.vue         # Room lobby
│   ├── RoomView.vue          # Game room
│   └── SettingsView.vue      # Settings page
├── App.vue
└── main.ts
```

## 📦 Installation

```sh
# Clone repository
git clone <repository-url>
cd javanese-chess-fe

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env
# Edit .env and set VITE_SOCKET_URL
```

## 🚀 Development

```sh
# Run development server
bun run dev

# Open browser at http://localhost:5173
```

### Other Commands

```sh
# Type checking
bun run type-check

# Build for production
bun run build

# Preview production build
bun run preview

# Run tests
bun run test:unit

# Lint code
bun run lint

# Format code
bun run format
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SOCKET_URL=http://localhost:3000
```

- **VITE_SOCKET_URL**: Backend WebSocket server URL

## 🤖 Bot Heuristic Configuration

Konfigurasi heuristic untuk bot AI yang dapat diatur melalui Settings page. Nilai-nilai ini dikirim ke backend untuk mengatur behavior bot.

### Default Values

| Condition / Action                        | Default Value |
| ----------------------------------------- | ------------- |
| **Basic Moves**                           |               |
| Legal move available                      | 30            |
| **Winning Condition**                     |               |
| Prioritize winning move (4 aligned cards) | 10000         |
| **Threat Detection (3 aligned)**          |               |
| Detect threat                             | 200           |
| Card values (to overwrite during threat)  |               |
| • Card 1                                  | 20            |
| • Card 2                                  | 30            |
| • Card 3                                  | 40            |
| • Card 4                                  | 50            |
| • Card 5                                  | 60            |
| • Card 6                                  | 70            |
| • Card 7                                  | 80            |
| • Card 8                                  | 90            |
| • Card 9                                  | 100           |
| Overwrite opponent card                   | 200           |
| Middle of threat formation                | 75            |
| Edge of threat formation                  | 50            |
| Block opponent's path                     | 100           |
| **Potential Threat (<3 adjacent)**        |               |
| Card values (prioritize smaller cards)    |               |
| • Card 1                                  | 100           |
| • Card 2                                  | 90            |
| • Card 3                                  | 80            |
| • Card 4                                  | 70            |
| • Card 5                                  | 60            |
| • Card 6                                  | 50            |
| • Card 7                                  | 40            |
| • Card 8                                  | 30            |
| • Card 9                                  | 20            |
| Overwrite opponent card                   | 125           |
| Block opponent's path                     | 70            |
| **Own Card Alignment**                    |               |
| 2 of own cards aligned                    | 50            |
| 3 of own cards aligned                    | 100           |
| **Strategic Moves**                       |               |
| Play the smallest card                    | 60            |
| Place card near own card                  | 60            |

### How to Configure

1. Go to **Settings** page
2. Scroll to **Bot Heuristic Configuration**
3. Adjust sliders untuk setiap value
4. Settings akan otomatis tersimpan di localStorage
5. Click **Reset to Defaults** untuk kembali ke nilai default

## 🔌 API Integration

### Socket Events

#### Client → Server

- `create-room` - Membuat room baru
- `join-room` - Join room yang ada
- `leave-room` - Leave room
- `start-game` - Mulai game
- `player-move` - Kirim player move

#### Server → Client

- `room-created` - Room berhasil dibuat
- `room-joined` - Berhasil join room
- `player-joined` - Player baru join
- `game-started` - Game dimulai
- `move-success` - Move valid
- `move-invalid` - Move invalid
- `game-over` - Game selesai

### REST API Endpoints (Backend)

```
GET  /                          # Main page
POST /create-room               # Buat room baru
POST /play                      # Start game
POST /move                      # Player move
POST /move-bot                  # Bot move
```

## 📝 Frontend Responsibilities

1. ✅ **Responsive Design** - Web & mobile support
2. ✅ **API Integration** - WebSocket communication
3. ✅ **Glassmorphism Theme** - Modern UI design
4. ✅ **Drag & Drop / Click Interaction** - Card placement
5. ✅ **Valid Move Calculation** - Highlight valid squares
6. ✅ **Settings Management** - Visual & heuristic config
7. 🚧 **Board Component** - 9x9 grid (upcoming)
8. 🚧 **Card Components** - Card hand & deck (upcoming)
9. 🚧 **Win Detection UI** - Victory screen (upcoming)

## 🎨 UI Features

### Visual Settings (Configurable)

- ✅ Show Valid Moves (ON/OFF)
- ✅ Show Card Preview (ON/OFF)
- ✅ Enable Animations (ON/OFF)
- 🚧 Sound Effects (ON/OFF) - upcoming

### Pages

- ✅ **Home** - Landing page dengan Create/Join room
- ✅ **Lobby** - Waiting room dengan player list
- ✅ **Game Room** - Main game interface (board upcoming)
- ✅ **Settings** - Configure visual & heuristic settings

## 👥 Team Division

### Frontend (This Project)

- Handle responsive design
- Integrate dengan API
- Glassmorphism theme implementation
- Handle drag & drop/click interactions
- Calculate possible moves (client-side)
- Shuffle cards (via API)

### Backend (Golang)

- WebSocket management
- Calculate bot moves (heuristic)
- Validate moves
- Detect winning conditions
- Calculate scores

## 🐛 Known Issues

- CSS lint errors untuk Tailwind directives (tidak mempengaruhi functionality)
- TypeScript lint warnings untuk type safety (akan di-fix secara bertahap)

## 📄 License

This project is part of UPH academic project.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and structure.

---

Made with ❤️ for UPH Road to Magister
