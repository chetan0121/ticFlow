# TicFlow

A modern, full-stack Tic-Tac-Toe experience. Play locally, challenge an AI, or compete with friends and strangers online in real time.

---

## Features

- **Multiple Game Modes** - Local (two players on one device), AI Bot, Private Online Rooms, and Global Matchmaking
- **AI Opponents** - Three difficulty levels: Random (Easy), Tactical (Medium), and Minimax (Hard)
- **Private Online Rooms** - Share a 6-character invite code, your opponent joins and the game begins
- **Matchmaking** - Automatically paired with a random online player
- **Game Rules** - Optional per-player timer and configurable move cap; games resume after a refresh
- **Session Persistence** - Sessions last 7 days (idle) and up to 90 days; in-progress online games survive disconnects with a 30-second reconnection window
- **Account System** - Signup/login with username & password; auth is cookie-based (HttpOnly, JWT-signed)
- **Responsive UI** - Works on desktop and mobile; built with React and Tailwind CSS v4

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Socket.IO Client |
| Backend | Bun / Node.js, Express 5, Socket.IO, Mongoose |
| Shared | TypeScript package (`@ticflow/shared`) - game engine, bot AI, types |
| Database | MongoDB |
| Auth | JWT (HS256), HttpOnly cookies, Argon2 password hashing |
| Tooling | TypeScript 5.9, ESLint, Prettier, Bun workspaces |

---

## Monorepo Structure

```
tic-flow/
├── frontend/       # React SPA (Vite)
├── backend/        # Express + Socket.IO API server
├── shared/         # Shared game engine, types, and constants
├── vercel.json     # SPA catch-all rewrite for Vercel deployment
└── package.json    # Root workspace
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.x` or [Node.js](https://nodejs.org) `>= 20.x` with npm
- A running [MongoDB](https://www.mongodb.com/) instance (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/tic-flow.git
cd tic-flow
```

### 2. Install dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Set up environment

Create `backend/.env`:
- See `backend\.env.example`

Create `frontend\.env`:
- Setup only for production

### 4. Start development servers

```bash
# Using Bun
bun run dev

# Using npm
npm run dev
```

This starts the frontend (Vite on `:5173`) and backend (on `:3000`) in parallel.

---

## Scripts

Run from the **repo root**.

| Script | Description |
|---|---|
| `dev` | Start frontend + backend in parallel (watch mode) |
| `build` | Build shared, frontend, and backend |
| `lint` | ESLint across all packages |
| `format` | Prettier across all packages |
| `ts-check` | TypeScript type-check across all packages |
| `release` | Format + lint + build (full release pipeline) |
| `preview` | Preview the production build locally |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DEV_MODE` | No | `false` | Allows non-HTTPS CORS origins; enables permissive socket auth |
| `PORT` | No | `3000` | Port the backend listens on |
| `MONGODB_URI` | Yes | - | MongoDB connection URI |
| `MONGODB_DB_NAME` | Yes | - | Database name |
| `JWT_SECRET` | Yes | - | Secret key for signing JWTs |
| `FRONTEND_ORIGINS` | Yes (prod) | - | Comma-separated HTTPS origins allowed by CORS |
| `DNS_SERVERS` | No | - | Comma-separated custom DNS servers |

---

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Create a new account |
| `POST` | `/auth/login` | Public | Log in and receive a session cookie |
| `GET` | `/auth/me` | Required | Get the current authenticated user |
| `POST` | `/auth/logout` | Public | Clear the session cookie |
| `GET` | `/health` | Public | Health check |

### Socket.IO Events

The backend uses Socket.IO for all real-time game communication.

**Friend Games**

| Event | Direction | Description |
|---|---|---|
| `friend-game:create` | Client -> Server | Create a new private room |
| `friend-game:join` | Client -> Server | Join a room by invite code |
| `friend-game:resume` | Client -> Server | Reconnect to an existing room |
| `friend-game:state` | Server -> Client | Authoritative game snapshot broadcast |
| `friend-game:move` | Client -> Server | Submit a move |
| `friend-game:draw` | Client -> Server | Request or accept a draw |
| `friend-game:rematch` | Client -> Server | Request or accept a rematch |
| `friend-game:leave` | Client -> Server | Leave the room |

**Matchmaking**

| Event | Direction | Description |
|---|---|---|
| `matchmaking:queue` | Client -> Server | Join the matchmaking queue |
| `matchmaking:cancel` | Client -> Server | Leave the queue |
| `matchmaking:resume` | Client -> Server | Reconnect to a matched game |
| `matchmaking:matched` | Server -> Client | Notifies both players a game has started |
| `matchmaking:state` | Server -> Client | Authoritative game snapshot broadcast |
| `matchmaking:queued` | Server -> Client | Confirms placement in queue |

---

## Game Rules

- **Board:** 3x3 Tic-Tac-Toe
- **Timer (optional):** Each player gets a configurable amount of time (1-960 minutes). Running out of time is a loss.
- **Move Cap (optional):** A configurable total-move limit (6-998 moves, must be even). Reaching the cap ends the game as a draw.
- **Online Disconnect Grace:** Players have **30 seconds** to reconnect before the game is finalised.
- **Draw Requests:** Either player can request a draw during a game; the opponent has 10 seconds to accept.

---

## Bot AI

| Difficulty | Algorithm | Description |
|---|---|---|
| Easy | Random | Picks any available cell at random |
| Medium | Tactical | Wins or blocks immediately; otherwise plays safe |
| Hard | Minimax | Optimal play, cannot be beaten |

---

## Deployment

### Frontend (Vercel)

The `vercel.json` at the repo root rewrites all routes to `index.html` for SPA support. In your Vercel project settings set:

- **Root Directory:** `frontend`
- **Build Command:** `bun run build` or `npm run build`
- **Output Directory:** `dist`

### Backend

Deploy to any Node.js or Bun-compatible platform:

```bash
# Build
bun run --cwd backend build   # or: npm run build --workspace=backend

# Run
bun dist/server.js            # or: node dist/server.js
```

Set all required environment variables on your platform before deploying.

---

## License

[MIT](./LICENSE)
