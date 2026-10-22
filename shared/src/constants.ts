/** Shared game-setting constraints. Clients render these limits; servers enforce them. */
export const GAME_TIME_LIMIT_MINUTES_MIN = 1
export const GAME_TIME_LIMIT_MINUTES_MAX = 960
export const GAME_MOVE_LIMIT_MIN = 6
export const GAME_MOVE_LIMIT_MAX = 998

export const GAME_TIME_LIMIT_RANGE = {
  min: GAME_TIME_LIMIT_MINUTES_MIN,
  max: GAME_TIME_LIMIT_MINUTES_MAX,
  step: 1,
  value: null,
} as const

export const GAME_MOVE_LIMIT_RANGE = {
  min: GAME_MOVE_LIMIT_MIN,
  max: GAME_MOVE_LIMIT_MAX,
  step: 2,
  value: null,
} as const

export const MINUTE_MS = 60_000

export const VALID_INVITE_CODE_LENGTH = 6
export const FRIEND_GAME_DISCONNECT_GRACE_MS = 30_000
