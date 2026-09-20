import type {
  RangeParam,
  OptionList,
  RangeValue,
  SetupText,
} from "./constants";

export interface OptionSelection<T> {
  options: OptionList<T>;
  currentOption: string;
  selectOption: (value: T) => void;
}

export interface DropDownOptions {
  key: string;
  text: SetupText;
  selection: OptionSelection<string>;
}

export interface RangeOptions {
  key: string;
  text: SetupText;
  range: RangeParam & {
    setValue: (value: RangeValue) => void;
  };
}

export type GameSetupOptions = DropDownOptions | RangeOptions;
