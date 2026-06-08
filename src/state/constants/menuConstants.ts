// Shared option types and game setup constants

import { Bot, Globe2, Handshake } from 'lucide-react'
import React, { type ReactElement } from 'react'

// Base value types for selectable options
export type OptionValue = 'friend' | 'bot' | 'online'

// Core option shape shared by dropdowns and config lists
export interface OptionItem {
  readonly logo: ReactElement | null
  readonly value: OptionValue
  readonly label: string
  readonly description: string
}

// Selection contract for option pickers
export interface OptionSelection {
  options: readonly OptionItem[]
  currentOption: OptionValue
  selectOption: (value: OptionValue) => void
}

// Null will be used as infinite
type specialType = number | null

// Range contract for numeric spinner controls
export interface RangeConfig {
  min: number
  max: number
  step: number
  value: specialType
}

// A simple helper type to handle the "readonly array" part once
type ModeList = OptionItem[]

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
