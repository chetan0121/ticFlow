import { randomBytes, randomUUID } from 'node:crypto'

import {
  GAME_MOVE_LIMIT_MAX,
  GAME_MOVE_LIMIT_MIN,
  GAME_TIME_LIMIT_MINUTES_MAX,
  GAME_TIME_LIMIT_MINUTES_MIN,
  VALID_INVITE_CODE_LENGTH,
  MINUTE_MS,
  GameEngine,
  createDefaultGameState,
  FRIEND_GAME_DISCONNECT_GRACE_MS,
} from '@ticflow/shared'
import type {
  CreateFriendGameResult,
  FriendGameSnapshot,
  GameConfig,
  GameState,
  JoinFriendGameResult,
  MatchmakingSnapshot,
  OnlineModeKind,
  PlayerMark,
  QueueMatchmakingResult,
  SocketCommandResult,
} from '@ticflow/shared'
import type { Server, Socket } from 'socket.io'

import { AUTH_COOKIE_NAME } from '../../config/constants.js'
import OnlineMode from '../../db/models/online-mode.js'
import { getSession } from '../auth/services.js'

const ROOM_PREFIX = 'friend-game:'
const DRAW_REQUEST_TIMEOUT_MS = 10_000
interface ConnectedUser {
  id: string
  username: string
}

interface OnlineModeRoom {
  id: string
  kind: OnlineModeKind
  inviteCode: string
  config: GameConfig
  game: GameState
  playerIds: Partial<Record<PlayerMark, string>>
  playerNames: Partial<Record<PlayerMark, string>>
  connectedUserIds: Set<string>
  drawRequestedBy: Set<PlayerMark>
  drawRequestTimers: Map<PlayerMark, ReturnType<typeof setTimeout>>
  rematchRequestedBy: Set<PlayerMark>
  lastClockUpdateAt: number
  disconnectTimer?: ReturnType<typeof setTimeout> | undefined
}

interface QueuedPlayer {
  socketId: string
  user: ConnectedUser
  config: GameConfig
}

type Ack<T extends SocketCommandResult = SocketCommandResult> = (result: T) => void

const roomsById = new Map<string, OnlineModeRoom>()
const roomIdByInviteCode = new Map<string, string>()
const usersBySocketId = new Map<string, ConnectedUser>()
const matchmakingQueue: QueuedPlayer[] = []

const MATCHMAKING_FIXED_CONFIG: GameConfig = {
  timeLimit: 2,
  moveLimit: 50,
}

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
    code = randomBytes(3).toString('hex').toUpperCase()
  } while (roomIdByInviteCode.has(code))
  return code
}

function getMark(room: OnlineModeRoom, userId: string): PlayerMark | null {
  if (room.playerIds.O === userId) return 'O'
  if (room.playerIds.X === userId) return 'X'
  return null
}

function snapshot(room: OnlineModeRoom, userId: string): FriendGameSnapshot {
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

function matchmakingSnapshot(room: OnlineModeRoom, userId: string): MatchmakingSnapshot {
  const { ...game } = snapshot(room, userId)
  return game
}

function sendState(io: Server, room: OnlineModeRoom): void {
  for (const socket of io.sockets.adapter.rooms.get(roomName(room.id)) ?? []) {
    const client = io.sockets.sockets.get(socket)
    const user = client ? usersBySocketId.get(client.id) : undefined
    if (client && user)
      client.emit(
        room.kind === 'matchmaking' ? 'matchmaking:state' : 'friend-game:state',
        room.kind === 'matchmaking'
          ? matchmakingSnapshot(room, user.id)
          : snapshot(room, user.id)
      )
  }
}

function clearDrawRequestTimer(room: OnlineModeRoom, mark: PlayerMark): void {
  const timer = room.drawRequestTimers.get(mark)
  if (timer) clearTimeout(timer)
  room.drawRequestTimers.delete(mark)
}

function clearDrawRequestTimers(room: OnlineModeRoom): void {
  for (const mark of room.drawRequestTimers.keys()) {
    clearDrawRequestTimer(room, mark)
  }
}

async function removeRoom(room: OnlineModeRoom): Promise<void> {
  if (room.disconnectTimer) clearTimeout(room.disconnectTimer)
  clearDrawRequestTimers(room)
  roomsById.delete(room.id)
  roomIdByInviteCode.delete(room.inviteCode)
  await OnlineMode.deleteOne({ gameId: room.id })
}

async function persistRoom(room: OnlineModeRoom): Promise<void> {
  await OnlineMode.findOneAndUpdate(
    { gameId: room.id },
    {
      gameId: room.id,
      kind: room.kind,
      inviteCode: room.inviteCode,
      config: room.config,
      game: room.game,
      playerIds: room.playerIds,
      playerNames: room.playerNames,
      drawRequestedBy: Array.from(room.drawRequestedBy),
      rematchRequestedBy: Array.from(room.rematchRequestedBy),
      lastClockUpdateAt: room.lastClockUpdateAt,
    },
    { upsert: true, setDefaultsOnInsert: true }
  )
}

function roomFromDocument(document: {
  gameId: string
  kind?: OnlineModeKind
  inviteCode: string
  config: GameConfig
  game: GameState
  playerIds: Partial<Record<PlayerMark, string>>
  playerNames: Partial<Record<PlayerMark, string>>
  drawRequestedBy: PlayerMark[]
  rematchRequestedBy: PlayerMark[]
  lastClockUpdateAt: number
}): OnlineModeRoom {
  return {
    id: document.gameId,
    kind: document.kind ?? 'friend',
    inviteCode: document.inviteCode,
    config: document.config,
    game: document.game,
    playerIds: document.playerIds,
    playerNames: document.playerNames,
    connectedUserIds: new Set(),
    drawRequestedBy: new Set(document.drawRequestedBy),
    drawRequestTimers: new Map(),
    rematchRequestedBy: new Set(document.rematchRequestedBy),
    lastClockUpdateAt: document.lastClockUpdateAt,
  }
}

function removeFromMatchmakingQueue(socketId: string): void {
  const index = matchmakingQueue.findIndex(entry => entry.socketId === socketId)
  if (index !== -1) matchmakingQueue.splice(index, 1)
}

function removeUserFromMatchmakingQueue(userId: string): void {
  for (let index = matchmakingQueue.length - 1; index >= 0; index -= 1) {
    if (matchmakingQueue[index]?.user.id === userId) matchmakingQueue.splice(index, 1)
  }
}

async function createMatchmakingRoom(
  io: Server,
  first: QueuedPlayer,
  second: QueuedPlayer
): Promise<QueuedPlayer[]> {
  const firstSocket = io.sockets.sockets.get(first.socketId)
  const secondSocket = io.sockets.sockets.get(second.socketId)
  if (!firstSocket || !secondSocket || !firstSocket.connected || !secondSocket.connected)
    return [first, second].filter(entry => io.sockets.sockets.get(entry.socketId)?.connected)

  const firstGetsO = (randomBytes(1)[0] ?? 0) % 2 === 0
  const playerO = firstGetsO ? first.user : second.user
  const playerX = firstGetsO ? second.user : first.user
  const room: OnlineModeRoom = {
    id: randomUUID(),
    kind: 'matchmaking',
    // Kept internally because the existing persistence model has an indexed code.
    // It is never returned or accepted by matchmaking clients.
    inviteCode: makeInviteCode(),
    config: MATCHMAKING_FIXED_CONFIG,
    game: createGameState(MATCHMAKING_FIXED_CONFIG, playerO.id, playerX.id),
    playerIds: { O: playerO.id, X: playerX.id },
    playerNames: { O: playerO.username, X: playerX.username },
    connectedUserIds: new Set([first.user.id, second.user.id]),
    drawRequestedBy: new Set(),
    drawRequestTimers: new Map(),
    rematchRequestedBy: new Set(),
    lastClockUpdateAt: Date.now(),
  }
  roomsById.set(room.id, room)
  roomIdByInviteCode.set(room.inviteCode, room.id)

  try {
    await Promise.all([
      joinSocketRoom(firstSocket, room.id),
      joinSocketRoom(secondSocket, room.id),
    ])
    await persistRoom(room)
    firstSocket.emit('matchmaking:matched', matchmakingSnapshot(room, first.user.id))
    secondSocket.emit('matchmaking:matched', matchmakingSnapshot(room, second.user.id))
    return []
  } catch (error) {
    console.error('Unable to create matchmaking game', error)
    roomsById.delete(room.id)
    roomIdByInviteCode.delete(room.inviteCode)
    firstSocket.emit('matchmaking:error', {
      error: 'Unable to start a match. Please try again.',
    })
    secondSocket.emit('matchmaking:error', {
      error: 'Unable to start a match. Please try again.',
    })
    return [first, second]
  }
}

async function loadRoomById(gameId: string): Promise<OnlineModeRoom | undefined> {
  const inMemory = roomsById.get(gameId)
  if (inMemory) return inMemory

  const document = await OnlineMode.findOne({ gameId }).lean()
  if (!document) return undefined

  const room = roomFromDocument({
    ...document,
    drawRequestedBy: document.drawRequestedBy as PlayerMark[],
    rematchRequestedBy: document.rematchRequestedBy as PlayerMark[],
  })
  roomsById.set(room.id, room)
  roomIdByInviteCode.set(room.inviteCode, room.id)
  return room
}

async function loadRoomByInviteCode(inviteCode: string): Promise<OnlineModeRoom | undefined> {
  const mappedId = roomIdByInviteCode.get(inviteCode)
  if (mappedId) return loadRoomById(mappedId)

  const document = await OnlineMode.findOne({ inviteCode }).lean()
  if (!document) return undefined

  const room = roomFromDocument({
    ...document,
    drawRequestedBy: document.drawRequestedBy as PlayerMark[],
    rematchRequestedBy: document.rematchRequestedBy as PlayerMark[],
  })
  roomsById.set(room.id, room)
  roomIdByInviteCode.set(room.inviteCode, room.id)
  return room
}

function updateClock(room: OnlineModeRoom): boolean {
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

async function joinSocketRoom(socket: Socket, gameId: string): Promise<void> {
  for (const joinedRoom of socket.rooms) {
    if (joinedRoom.startsWith(ROOM_PREFIX) && joinedRoom !== roomName(gameId))
      await socket.leave(joinedRoom)
  }
  await socket.join(roomName(gameId))
}

function resetForRematch(room: OnlineModeRoom): void {
  const playerOId = room.playerIds.O
  const playerXId = room.playerIds.X
  const playerOName = room.playerNames.O
  const playerXName = room.playerNames.X
  if (!playerOId || !playerXId || !playerOName || !playerXName) return

  const ownerGetsO = (randomBytes(1)[0] ?? 0) % 2 === 0
  const assignedOId = ownerGetsO ? playerOId : playerXId
  const assignedXId = ownerGetsO ? playerXId : playerOId
  room.playerIds = { O: assignedOId, X: assignedXId }
  room.playerNames = {
    O: ownerGetsO ? playerOName : playerXName,
    X: ownerGetsO ? playerXName : playerOName,
  }
  room.game = createGameState(room.config, assignedOId, assignedXId)
  room.drawRequestedBy.clear()
  clearDrawRequestTimers(room)
  room.rematchRequestedBy.clear()
  room.lastClockUpdateAt = Date.now()
}

function resetForWaiting(room: OnlineModeRoom, remainingUser: ConnectedUser): void {
  room.playerIds = { O: remainingUser.id }
  room.playerNames = { O: remainingUser.username }
  room.game = createGameState(room.config, remainingUser.id)
  room.drawRequestedBy.clear()
  clearDrawRequestTimers(room)
  room.rematchRequestedBy.clear()
  room.lastClockUpdateAt = Date.now()
}

async function finishAfterDisconnect(room: OnlineModeRoom, io: Server): Promise<void> {
  if (room.connectedUserIds.size !== 1 || room.game.status !== 'playing') return

  const remainingUserId = Array.from(room.connectedUserIds)[0]
  const remainingMark = remainingUserId ? getMark(room, remainingUserId) : null
  if (!remainingMark) return

  room.game.winner = remainingMark
  room.game.status = 'finished'
  await persistRoom(room)
  sendState(io, room)
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
      async (config: unknown, acknowledge: Ack<CreateFriendGameResult>) => {
        if (!isGameConfig(config)) return acknowledge({ error: 'Invalid game settings' })

        const id = randomUUID()
        const room: OnlineModeRoom = {
          id,
          kind: 'friend',
          inviteCode: makeInviteCode(),
          config,
          game: createGameState(config, user.id),
          playerIds: { O: user.id },
          playerNames: { O: user.username },
          connectedUserIds: new Set([user.id]),
          drawRequestedBy: new Set(),
          drawRequestTimers: new Map(),
          rematchRequestedBy: new Set(),
          lastClockUpdateAt: Date.now(),
        }
        roomsById.set(id, room)
        roomIdByInviteCode.set(room.inviteCode, id)
        try {
          await joinSocketRoom(socket, id)
          await persistRoom(room)
          acknowledge({ game: snapshot(room, user.id) })
        } catch (error) {
          console.error('Unable to create friend game', error)
          roomsById.delete(id)
          roomIdByInviteCode.delete(room.inviteCode)
          acknowledge({ error: 'Unable to create the game. Please try again.' })
        }
      }
    )

    socket.on(
      'matchmaking:queue',
      async (configOrAck: unknown, maybeAck?: Ack<QueueMatchmakingResult>) => {
        const acknowledge =
          typeof configOrAck === 'function'
            ? (configOrAck as Ack<QueueMatchmakingResult>)
            : maybeAck
        if (!acknowledge) return

        removeUserFromMatchmakingQueue(user.id)
        matchmakingQueue.push({ socketId: socket.id, user, config: MATCHMAKING_FIXED_CONFIG })
        const first = matchmakingQueue.shift()
        const second = matchmakingQueue.shift()

        if (!first || !second) {
          if (first) matchmakingQueue.unshift(first)
          acknowledge({ queued: true })
          return
        }

        const unmatched = await createMatchmakingRoom(io, first, second)
        matchmakingQueue.unshift(...unmatched)
        acknowledge({ queued: true })
      }
    )

    socket.on('matchmaking:cancel', (acknowledge: Ack) => {
      removeFromMatchmakingQueue(socket.id)
      acknowledge({})
    })

    socket.on(
      'matchmaking:resume',
      async (gameId: unknown, acknowledge: Ack<QueueMatchmakingResult>) => {
        const room = typeof gameId === 'string' ? await loadRoomById(gameId) : undefined
        const mark = room ? getMark(room, user.id) : null
        if (!room || room.kind !== 'matchmaking' || !mark)
          return acknowledge({ error: 'This match is no longer available' })

        if (room.disconnectTimer) {
          clearTimeout(room.disconnectTimer)
          room.disconnectTimer = undefined
        }
        room.connectedUserIds.add(user.id)
        await joinSocketRoom(socket, room.id)
        await persistRoom(room)
        acknowledge({ game: matchmakingSnapshot(room, user.id) })
        sendState(io, room)
      }
    )

    socket.on(
      'friend-game:resume',
      async (gameId: unknown, acknowledge: Ack<JoinFriendGameResult>) => {
        const room = typeof gameId === 'string' ? await loadRoomById(gameId) : undefined
        const mark = room ? getMark(room, user.id) : null
        if (!room || room.kind !== 'friend' || !mark)
          return acknowledge({ error: 'This game is no longer available' })

        if (room.disconnectTimer) {
          clearTimeout(room.disconnectTimer)
          room.disconnectTimer = undefined
        }
        room.connectedUserIds.add(user.id)
        await joinSocketRoom(socket, room.id)
        await persistRoom(room)
        acknowledge({ game: snapshot(room, user.id) })
        sendState(io, room)
      }
    )

    socket.on(
      'friend-game:join',
      async (inviteCode: unknown, acknowledge: Ack<JoinFriendGameResult>) => {
        const normalizedCode =
          typeof inviteCode === 'string' ? inviteCode.trim().toUpperCase() : ''
        if (!normalizedCode)
          return acknowledge({ error: 'Enter an invite code to join a game' })
        if (normalizedCode.length !== VALID_INVITE_CODE_LENGTH)
          return acknowledge({
            error: `Invite code must be exactly ${VALID_INVITE_CODE_LENGTH} characters`,
          })
        const room = await loadRoomByInviteCode(normalizedCode)
        if (!room)
          return acknowledge({
            error: "This room doesn't exist or is no longer available",
          })

        const existingMark = getMark(room, user.id)
        if (existingMark) {
          if (room.disconnectTimer) {
            clearTimeout(room.disconnectTimer)
            room.disconnectTimer = undefined
          }
          room.connectedUserIds.add(user.id)
          await joinSocketRoom(socket, room.id)
          await persistRoom(room)
          acknowledge({ game: snapshot(room, user.id) })
          sendState(io, room)
          return
        }
        if (room.game.status !== 'waiting' || room.playerIds.X)
          return acknowledge({ error: 'This game is full' })

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
        await joinSocketRoom(socket, room.id)
        await persistRoom(room)
        acknowledge({ game: snapshot(room, user.id) })
        sendState(io, room)
      }
    )

    socket.on('friend-game:leave', async (rawGameId: unknown, acknowledge?: Ack) => {
      const gameId = assertGameId(rawGameId)
      const room = gameId ? roomsById.get(gameId) : undefined
      const mark = room ? getMark(room, user.id) : null
      if (!room || !mark) return acknowledge?.({ error: 'Game is no longer available' })

      room.connectedUserIds.delete(user.id)
      await socket.leave(roomName(room.id))
      await persistRoom(room)
      sendState(io, room)
      if (room.connectedUserIds.size === 1) {
        if (room.disconnectTimer) clearTimeout(room.disconnectTimer)
        room.disconnectTimer = setTimeout(() => {
          room.disconnectTimer = undefined
          finishAfterDisconnect(room, io).catch(error => {
            console.error('Unable to finish friend game', error)
          })
        }, FRIEND_GAME_DISCONNECT_GRACE_MS)
      }
      acknowledge?.({})
    })

    socket.on('friend-game:move', async (payload: unknown, acknowledge: Ack) => {
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
      await persistRoom(room)
      sendState(io, room)
      acknowledge({})
    })

    socket.on(
      'friend-game:rematch',
      async (rawGameId: unknown, acknowledge: Ack<SocketCommandResult & { queued?: boolean }>) => {
        const gameId = assertGameId(rawGameId)
        const room = gameId ? roomsById.get(gameId) : undefined
        const mark = room ? getMark(room, user.id) : null
        if (!room || !mark || room.game.status !== 'finished')
          return acknowledge({ error: 'A rematch is not available' })

        room.rematchRequestedBy.add(mark)
        if (room.rematchRequestedBy.size === 2) {
          resetForRematch(room)
          await persistRoom(room)
          sendState(io, room)
          acknowledge({})
          return
        }

        if (room.kind === 'matchmaking' && room.connectedUserIds.size === 1) {
          // Opponent left the finished matchmaking game: re-queue the remaining
          // player instead of leaving them in a one-player "waiting" room.
          await socket.leave(roomName(room.id))
          await removeRoom(room)
          removeFromMatchmakingQueue(user.id)
          matchmakingQueue.push({ socketId: socket.id, user, config: MATCHMAKING_FIXED_CONFIG })
          const first = matchmakingQueue.shift()
          const second = matchmakingQueue.shift()
          if (first && second) {
            const unmatched = await createMatchmakingRoom(io, first, second)
            matchmakingQueue.unshift(...unmatched)
          } else if (first) {
            matchmakingQueue.unshift(first)
          }
          acknowledge({ queued: true })
          return
        }

        if (room.connectedUserIds.size === 1 && room.game.status === 'finished') {
          resetForWaiting(room, user)
        }

        await persistRoom(room)
        sendState(io, room)
        acknowledge({})
      },
    )

    socket.on('friend-game:draw', async (rawGameId: unknown, acknowledge: Ack) => {
      const gameId = assertGameId(rawGameId)
      const room = gameId ? roomsById.get(gameId) : undefined
      const mark = room ? getMark(room, user.id) : null
      if (!room || !mark || room.game.status !== 'playing')
        return acknowledge({ error: 'A draw is not available' })

      room.drawRequestedBy.add(mark)
      if (room.drawRequestedBy.size === 2) {
        clearDrawRequestTimers(room)
        room.game.winner = 'draw'
        room.game.status = 'finished'
      } else {
        clearDrawRequestTimer(room, mark)
        const timer = setTimeout(() => {
          room.drawRequestTimers.delete(mark)
          if (room.game.status !== 'playing' || !room.drawRequestedBy.delete(mark)) return
          persistRoom(room)
            .then(() => sendState(io, room))
            .catch(error => {
              console.error('Unable to expire draw request', error)
            })
        }, DRAW_REQUEST_TIMEOUT_MS)
        room.drawRequestTimers.set(mark, timer)
      }
      await persistRoom(room)
      sendState(io, room)
      acknowledge({})
    })

    socket.on('disconnect', () => {
      usersBySocketId.delete(socket.id)
      removeFromMatchmakingQueue(socket.id)
      for (const room of roomsById.values()) {
        if (getMark(room, user.id)) {
          const stillConnected = Array.from(io.sockets.sockets.values()).some(client => {
            const connectedUser = usersBySocketId.get(client.id)
            return client.connected && connectedUser?.id === user.id
          })
          if (!stillConnected) {
            room.connectedUserIds.delete(user.id)
            if (room.connectedUserIds.size === 0) {
              if (room.disconnectTimer) clearTimeout(room.disconnectTimer)
              room.disconnectTimer = setTimeout(() => {
                room.disconnectTimer = undefined
                if (room.connectedUserIds.size === 0) {
                  removeRoom(room).catch(error => {
                    console.error('Unable to remove expired friend game', error)
                  })
                }
              }, FRIEND_GAME_DISCONNECT_GRACE_MS)
              persistRoom(room).catch(error => {
                console.error('Unable to persist disconnected friend game', error)
              })
            } else {
              if (room.kind === 'matchmaking' && room.game.status === 'finished') {
                // Opponent left a finished matchmaking game: re-queue the remaining
                // player immediately instead of waiting the disconnect grace period.
                if (room.disconnectTimer) clearTimeout(room.disconnectTimer)
                room.disconnectTimer = undefined
                const remainingUserId = Array.from(room.connectedUserIds)[0]!
                let remainingSocket: Socket | undefined
                for (const client of io.sockets.sockets.values()) {
                  if (client.connected && usersBySocketId.get(client.id)?.id === remainingUserId) {
                    remainingSocket = client
                    break
                  }
                }
                if (remainingSocket) {
                  void remainingSocket.leave(roomName(room.id))
                }
                removeRoom(room).catch(error => {
                  console.error('Unable to remove expired matchmaking game', error)
                })
                removeFromMatchmakingQueue(remainingUserId)
                const remainingUser = remainingSocket ? usersBySocketId.get(remainingSocket.id) : undefined
                if (remainingUser && remainingSocket) {
                  matchmakingQueue.push({ socketId: remainingSocket.id, user: remainingUser, config: MATCHMAKING_FIXED_CONFIG })
                  const first = matchmakingQueue.shift()
                  const second = matchmakingQueue.shift()
                  if (first && second) {
                    void createMatchmakingRoom(io, first, second).then(unmatched => {
                      matchmakingQueue.unshift(...unmatched)
                    }).catch(error => {
                      console.error('Unable to create matchmaking room', error)
                      matchmakingQueue.unshift(first, second)
                    })
                  } else if (first) {
                    matchmakingQueue.unshift(first)
                    remainingSocket.emit('matchmaking:queued', { queued: true })
                  }
                }
                return
              }
              if (room.disconnectTimer) clearTimeout(room.disconnectTimer)
              room.disconnectTimer = setTimeout(() => {
                room.disconnectTimer = undefined
                finishAfterDisconnect(room, io).catch(error => {
                  console.error('Unable to finish disconnected friend game', error)
                })
              }, FRIEND_GAME_DISCONNECT_GRACE_MS)
              persistRoom(room).catch(error => {
                console.error('Unable to persist disconnected friend game', error)
              })
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
