import { randomBytes, randomUUID } from 'node:crypto'

import {
  GAME_MOVE_LIMIT_MAX,
  GAME_MOVE_LIMIT_MIN,
  GAME_TIME_LIMIT_MINUTES_MAX,
  GAME_TIME_LIMIT_MINUTES_MIN,
  MINUTE_MS,
  GameEngine,
  createDefaultGameState,
} from '@ticflow/shared'
import type {
  CreateFriendGameResult,
  FriendGameSnapshot,
  GameConfig,
  GameState,
  JoinFriendGameResult,
  PlayerMark,
  SocketCommandResult,
} from '@ticflow/shared'
import type { Server, Socket } from 'socket.io'

import { AUTH_COOKIE_NAME } from '../../config/constants.js'
import { getSession } from '../auth/services.js'

const ROOM_PREFIX = 'friend-game:'
interface ConnectedUser {
  id: string
  username: string
}

interface FriendGameRoom {
  id: string
  inviteCode: string
  config: GameConfig
  game: GameState
  playerIds: Partial<Record<PlayerMark, string>>
  playerNames: Partial<Record<PlayerMark, string>>
  connectedUserIds: Set<string>
  drawRequestedBy: Set<PlayerMark>
  rematchRequestedBy: Set<PlayerMark>
  lastClockUpdateAt: number
}

type Ack<T extends SocketCommandResult = SocketCommandResult> = (result: T) => void

const roomsById = new Map<string, FriendGameRoom>()
const roomIdByInviteCode = new Map<string, string>()
const usersBySocketId = new Map<string, ConnectedUser>()

function roomName(gameId: string): string {
  return `${ROOM_PREFIX}${gameId}`
}

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined

  return header
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}

function isGameConfig(value: unknown): value is GameConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Record<string, unknown>
  const validTime =
    config.timeLimit === null ||
    (Number.isInteger(config.timeLimit) &&
      Number(config.timeLimit) >= GAME_TIME_LIMIT_MINUTES_MIN &&
      Number(config.timeLimit) <= GAME_TIME_LIMIT_MINUTES_MAX)
  const validMoves =
    config.moveLimit === null ||
    (Number.isInteger(config.moveLimit) &&
      Number(config.moveLimit) >= GAME_MOVE_LIMIT_MIN &&
      Number(config.moveLimit) <= GAME_MOVE_LIMIT_MAX)

  return validTime && validMoves
}

function createGameState(config: GameConfig, playerOId: string, playerXId = ''): GameState {
  const game = createDefaultGameState()
  const remainingTime = config.timeLimit === null ? null : config.timeLimit * MINUTE_MS

  game.status = playerXId ? 'playing' : 'waiting'
  game.playerO.userId = playerOId
  game.playerX.userId = playerXId
  game.playerO.remainingTime = remainingTime
  game.playerX.remainingTime = remainingTime
  return game
}

function makeInviteCode(): string {
  let code: string
  do {
    code = randomBytes(4).toString('hex').toUpperCase()
  } while (roomIdByInviteCode.has(code))
  return code
}

function getMark(room: FriendGameRoom, userId: string): PlayerMark | null {
  if (room.playerIds.O === userId) return 'O'
  if (room.playerIds.X === userId) return 'X'
  return null
}

function snapshot(room: FriendGameRoom, userId: string): FriendGameSnapshot {
  const players: FriendGameSnapshot['players'] = {}

  for (const mark of ['O', 'X'] as const) {
    const id = room.playerIds[mark]
    const username = room.playerNames[mark]
    if (id && username) {
      players[mark] = { id, username, mark, connected: room.connectedUserIds.has(id) }
    }
  }

  return {
    id: room.id,
    inviteCode: room.inviteCode,
    config: room.config,
    game: room.game,
    players,
    myMark: getMark(room, userId),
    drawRequestedBy: Array.from(room.drawRequestedBy),
    rematchRequestedBy: Array.from(room.rematchRequestedBy),
  }
}

function sendState(io: Server, room: FriendGameRoom): void {
  for (const socket of io.sockets.adapter.rooms.get(roomName(room.id)) ?? []) {
    const client = io.sockets.sockets.get(socket)
    const user = client ? usersBySocketId.get(client.id) : undefined
    if (client && user) client.emit('friend-game:state', snapshot(room, user.id))
  }
}

function removeRoom(room: FriendGameRoom): void {
  roomsById.delete(room.id)
  roomIdByInviteCode.delete(room.inviteCode)
}

function updateClock(room: FriendGameRoom): boolean {
  if (room.game.status !== 'playing' || room.config.timeLimit === null) return false

  const now = Date.now()
  const elapsed = now - room.lastClockUpdateAt
  if (elapsed <= 0) return false
  room.lastClockUpdateAt = now

  const mark = room.game.baseGame.currentTurn
  const player = mark === 'O' ? room.game.playerO : room.game.playerX
  if (player.remainingTime === null) return false

  player.remainingTime = Math.max(0, player.remainingTime - elapsed)
  if (player.remainingTime === 0) {
    room.game.winner = mark === 'O' ? 'X' : 'O'
    room.game.status = 'finished'
  }
  return true
}

function assertGameId(value: unknown): string | null {
  return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value) ? value : null
}

function joinSocketRoom(socket: Socket, gameId: string): void {
  for (const joinedRoom of socket.rooms) {
    if (joinedRoom.startsWith(ROOM_PREFIX) && joinedRoom !== roomName(gameId))
      void socket.leave(joinedRoom)
  }
  void socket.join(roomName(gameId))
}

function resetForRematch(room: FriendGameRoom): void {
  const playerOId = room.playerIds.O
  const playerXId = room.playerIds.X
  if (!playerOId || !playerXId) return
  room.game = createGameState(room.config, playerOId, playerXId)
  room.drawRequestedBy.clear()
  room.rematchRequestedBy.clear()
  room.lastClockUpdateAt = Date.now()
}

export function attachFriendGameSocket(io: Server): void {
  io.use((socket, next) => {
    const token = readCookie(socket.handshake.headers.cookie, AUTH_COOKIE_NAME)
    if (!token) return next(new Error('Unauthorized'))

    void getSession(token)
      .then(session => {
        usersBySocketId.set(socket.id, {
          id: session.user.id,
          username: session.user.username,
        })
        next()
      })
      .catch(() => next(new Error('Unauthorized')))
  })

  io.on('connection', socket => {
    const user = usersBySocketId.get(socket.id)
    if (!user) return socket.disconnect(true)

    socket.on(
      'friend-game:create',
      (config: unknown, acknowledge: Ack<CreateFriendGameResult>) => {
        if (!isGameConfig(config)) return acknowledge({ error: 'Invalid game settings' })

        const id = randomUUID()
        const room: FriendGameRoom = {
          id,
          inviteCode: makeInviteCode(),
          config,
          game: createGameState(config, user.id),
          playerIds: { O: user.id },
          playerNames: { O: user.username },
          connectedUserIds: new Set([user.id]),
          drawRequestedBy: new Set(),
          rematchRequestedBy: new Set(),
          lastClockUpdateAt: Date.now(),
        }
        roomsById.set(id, room)
        roomIdByInviteCode.set(room.inviteCode, id)
        joinSocketRoom(socket, id)
        acknowledge({ game: snapshot(room, user.id) })
      }
    )

    socket.on(
      'friend-game:join',
      (inviteCode: unknown, acknowledge: Ack<JoinFriendGameResult>) => {
        const normalizedCode =
          typeof inviteCode === 'string' ? inviteCode.trim().toUpperCase() : ''
        const gameId = roomIdByInviteCode.get(normalizedCode)
        const room = gameId ? roomsById.get(gameId) : undefined
        if (!room) return acknowledge({ error: 'That invite code is not valid' })

        const existingMark = getMark(room, user.id)
        if (existingMark) {
          room.connectedUserIds.add(user.id)
          joinSocketRoom(socket, room.id)
          acknowledge({ game: snapshot(room, user.id) })
          sendState(io, room)
          return
        }
        if (room.game.status !== 'waiting' || room.playerIds.X)
          return acknowledge({ error: 'This game is no longer available' })

        room.playerIds.X = user.id
        room.playerNames.X = user.username
        room.connectedUserIds.add(user.id)
        const playerOId = room.playerIds.O
        const playerOName = room.playerNames.O
        if (!playerOId || !playerOName)
          return acknowledge({ error: 'Game owner is unavailable' })

        // Neither player gets an advantage from creating the room: assigning O
        // here gives each friend the same 50% chance, while O still starts.
        const ownerGetsO = (randomBytes(1)[0] ?? 0) % 2 === 0
        const assignedOId = ownerGetsO ? playerOId : user.id
        const assignedXId = ownerGetsO ? user.id : playerOId
        room.playerIds = ownerGetsO
          ? { O: playerOId, X: user.id }
          : { O: user.id, X: playerOId }
        room.playerNames = ownerGetsO
          ? { O: playerOName, X: user.username }
          : { O: user.username, X: playerOName }
        room.game = createGameState(room.config, assignedOId, assignedXId)
        room.lastClockUpdateAt = Date.now()
        joinSocketRoom(socket, room.id)
        acknowledge({ game: snapshot(room, user.id) })
        sendState(io, room)
      }
    )

    socket.on('friend-game:move', (payload: unknown, acknowledge: Ack) => {
      if (!payload || typeof payload !== 'object') return acknowledge({ error: 'Invalid move' })
      const move = payload as Record<string, unknown>
      const gameId = assertGameId(move.gameId)
      const row = move.row
      const column = move.column
      const room = gameId ? roomsById.get(gameId) : undefined
      if (
        !room ||
        typeof row !== 'number' ||
        typeof column !== 'number' ||
        !Number.isInteger(row) ||
        !Number.isInteger(column)
      )
        return acknowledge({ error: 'Invalid move' })

      const mark = getMark(room, user.id)
      if (!mark || mark !== room.game.baseGame.currentTurn)
        return acknowledge({ error: 'It is not your turn' })

      updateClock(room)
      if (room.game.status !== 'playing') {
        sendState(io, room)
        return acknowledge({ error: 'Game is over' })
      }
      const nextGame = GameEngine.nextMove(room.game, [row, column], room.config)
      if (!nextGame) return acknowledge({ error: 'That move is not allowed' })
      room.game = nextGame
      room.lastClockUpdateAt = Date.now()
      sendState(io, room)
      acknowledge({})
    })

    socket.on('friend-game:rematch', (rawGameId: unknown, acknowledge: Ack) => {
      const gameId = assertGameId(rawGameId)
      const room = gameId ? roomsById.get(gameId) : undefined
      const mark = room ? getMark(room, user.id) : null
      if (!room || !mark || room.game.status !== 'finished')
        return acknowledge({ error: 'A rematch is not available' })

      room.rematchRequestedBy.add(mark)
      if (room.rematchRequestedBy.size === 2) resetForRematch(room)
      sendState(io, room)
      acknowledge({})
    })

    socket.on('friend-game:draw', (rawGameId: unknown, acknowledge: Ack) => {
      const gameId = assertGameId(rawGameId)
      const room = gameId ? roomsById.get(gameId) : undefined
      const mark = room ? getMark(room, user.id) : null
      if (!room || !mark || room.game.status !== 'playing')
        return acknowledge({ error: 'A draw is not available' })

      room.drawRequestedBy.add(mark)
      if (room.drawRequestedBy.size === 2) {
        room.game.winner = 'draw'
        room.game.status = 'finished'
      }
      sendState(io, room)
      acknowledge({})
    })

    socket.on('disconnect', () => {
      usersBySocketId.delete(socket.id)
      for (const room of roomsById.values()) {
        if (getMark(room, user.id)) {
          const stillConnected = Array.from(io.sockets.sockets.values()).some(client => {
            const connectedUser = usersBySocketId.get(client.id)
            return client.connected && connectedUser?.id === user.id
          })
          if (!stillConnected) {
            room.connectedUserIds.delete(user.id)
            if (room.connectedUserIds.size === 0) {
              removeRoom(room)
            } else {
              sendState(io, room)
            }
          }
        }
      }
    })
  })

  setInterval(() => {
    for (const room of roomsById.values()) {
      if (updateClock(room)) sendState(io, room)
    }
  }, 250).unref()
}
