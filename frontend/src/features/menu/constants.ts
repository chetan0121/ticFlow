import {
  Bot,
  Crown,
  Globe,
  Globe2,
  Handshake,
  Sword,
  User,
  Users,
  Zap,
} from "lucide-react";
import React, { type ReactElement } from "react";
import { GAME_MOVE_LIMIT_RANGE, GAME_TIME_LIMIT_RANGE } from "@ticflow/shared";

// Main modes
export type CoreModes = "friend" | "bot" | "online";

// Sub modes
export type FriendSubMode = "flocal" | "fOnline";
export type BotSubMode = "easy" | "medium" | "hard";
export type OnlineSubMode = "matchmaking";

// Union of Sub modes
export type SubModes = FriendSubMode | BotSubMode | OnlineSubMode;

// Core option structure for dropdowns
export interface OptionItem<T> {
  logo: ReactElement | null;
  value: T;
  label: string;
  description: string;
}

// For Dropdown options
export type OptionList<T> = OptionItem<T>[];

// For range options
export type RangeValue = number | null;

// Range contract for numeric spinner controls
export interface RangeParam {
  min: number;
  max: number;
  step: number;
  value: RangeValue;
}

export interface SetupText {
  label: string;
  helper: string;
  modalTitle?: string;
  listboxLabel?: string;
}

export interface FullModeType<T> {
  text: SetupText;
  modes: OptionList<T>;
}

export const GAME_MODES = (): FullModeType<CoreModes> => ({
  text: {
    label: "Play With",
    helper: "Choose who you want to play against",
    modalTitle: "Select Mode",
    listboxLabel: "Play with",
  },
  modes: [
    {
      logo: React.createElement(Handshake),
      value: "friend",
      label: "Friend",
      description: "Play with friends",
    },
    {
      logo: React.createElement(Bot),
      value: "bot",
      label: "Bot",
      description: "Challenge an AI opponent",
    },
    {
      logo: React.createElement(Globe2),
      value: "online",
      label: "Online",
      description: "Match with random players",
    },
  ],
});

export const GAME_SUB_MODES = (mode: CoreModes): FullModeType<SubModes> => {
  const mapping: Record<CoreModes, Array<OptionItem<SubModes>>> = {
    friend: [
      {
        logo: React.createElement(User),
        value: "flocal",
        label: "Local",
        description: "Play on same device",
      },
      {
        logo: React.createElement(Users),
        value: "fOnline",
        label: "Online",
        description: "Invite a friend to play",
      },
    ],
    bot: [
      {
        logo: React.createElement(Zap),
        value: "easy",
        label: "Easy",
        description: "Beginner friendly AI",
      },
      {
        logo: React.createElement(Sword),
        value: "medium",
        label: "Medium",
        description: "Balanced challenge",
      },
      {
        logo: React.createElement(Crown),
        value: "hard",
        label: "Hard",
        description: "Expert level AI",
      },
    ],
    online: [
      {
        logo: React.createElement(Globe),
        value: "matchmaking",
        label: "Matchmaking",
        description: "Find random opponents",
      },
    ],
  };

  return {
    text: {
      label: "Select Mode",
      helper: "Choose how do you play",
      modalTitle: "Select Mode",
    },
    modes: mapping[mode] || [],
  };
};

export const GAME_TIME_CONTROLS = {
  text: {
    label: "Player Timer",
    helper: "The time each player gets (in minutes)",
  } satisfies SetupText,
  range: GAME_TIME_LIMIT_RANGE satisfies RangeParam,
};

export const GAME_MOVE_LIMITS = {
  text: {
    label: "Move Cap",
    helper: "The total move limit before a draw",
  } satisfies SetupText,
  range: GAME_MOVE_LIMIT_RANGE satisfies RangeParam,
};
