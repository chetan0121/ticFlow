import type { ReactNode } from "react";
import MenuDropdown from "./Dropdown";
import RangeStepper from "./RangeStepper";
import { useGameSetupOptions } from "../hooks/useGameSetupOptions";
import GameMenuGrid from "./MenuSetupGrid";

interface MenuSetupPanelProps {
  children?: ReactNode;
}

function MenuSetupPanel({ children }: MenuSetupPanelProps) {
  const setupOptions = useGameSetupOptions();

  return (
    <GameMenuGrid>
      {setupOptions.map((option) => {
        if ("selection" in option && option.selection.options.length >= 2) {
          return <MenuDropdown {...option} key={option.key} />;
        } else if ("range" in option) {
          return <RangeStepper {...option} key={option.key} />;
        }

        return null;
      })}
      {children}
    </GameMenuGrid>
  );
}

export default MenuSetupPanel;
