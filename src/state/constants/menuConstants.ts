import { Bot, Globe2, Handshake } from 'lucide-react'
import React, { type ReactElement } from 'react'

// Main modes
export type OptionValue = 'friend' | 'bot' | 'online'

// Sub modes
export type FriendSubMode = 'flocal' | 'fOnline'
export type BotSubMode = 'easy' | 'medium' | 'hard'
export type OnlineSubMode = 'matchmaking'

// Union of Sub modes
export type UnionSubModes = FriendSubMode | BotSubMode | OnlineSubMode

// Core option structure for dropdowns
export interface OptionItem {
  readonly logo: ReactElement | null
  readonly value: OptionValue
  readonly label: string
  readonly description: string
}

// For Dropdown options
type ModeList = readonly OptionItem[]

// Selection contract for option pickers
export interface OptionSelection {
  options: ModeList
  currentOption: OptionValue
  selectOption: (value: OptionValue) => void
}

// For range options
type specialType = number | null

// Range contract for numeric spinner controls
export interface RangeConfig {
  min: number
  max: number
  step: number
  value: specialType
}

export interface SetupText {
  label: string
  helper: string
  modalTitle?: string
  listboxLabel?: string
}

export const GAME_SETUP_TEXT: Record<string, SetupText> = {
  mode: {
    label: 'Play With',
    helper: 'Choose who you want to play against',
    modalTitle: 'Select Mode',
    listboxLabel: 'Play with',
  },
  turnTimer: {
    label: 'Player Timer',
    helper: 'The time each player gets (in minutes)',
  },
  moveCap: {
    label: 'Move Cap',
    helper: 'The total move limit before a draw',
  },
}

export const GAME_MODES: ModeList = [
  {
    logo: React.createElement(Handshake),
    value: 'friend',
    label: 'Friend',
    description: 'Play with friends',
  },
  {
    logo: React.createElement(Bot),
    value: 'bot',
    label: 'Bot',
    description: 'Challenge an AI opponent',
  },
  {
    logo: React.createElement(Globe2),
    value: 'online',
    label: 'Online',
    description: 'Match with random players',
  },
]

export const GAME_TIME_CONTROLS: RangeConfig = {
  min: 1,
  max: 960,
  step: 1,
  value: null,
}

export const GAME_MOVE_LIMITS: RangeConfig = {
  min: 6,
  max: 998,
  step: 2,
  value: null,
}

/** Derived Types from Configuration */

export type GameMode = OptionValue

export type GameTimeControl = specialType

export type GameMoveLimit = specialType
