import type { LucideIcon } from "lucide-react";
import useFullscreenAction from "./items/useFullscreenAction";

interface SidebarNavItem {
  key: string;
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
}

function SidebarNavigation() {
  const fullscreenAction = useFullscreenAction();
  const items: SidebarNavItem[] = [fullscreenAction];

  return (
    <div className="border-y border-t-3 border-white/10 border-t-white/20">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className="group flex h-12 w-full items-center justify-between gap-3 border-x-0 border-t-0 border-b border-white/10 bg-transparent px-4 text-left font-['Montserrat'] text-base font-semibold text-white/80 transition-all duration-200 last:border-b-0 hover:bg-white/10 hover:pl-5 hover:text-white active:bg-white/[0.14]"
        >
          <span className="min-w-0 truncate">{item.label}</span>
          <span className="flex shrink-0 items-center justify-center text-[hsl(38,95%,70%)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[hsl(38,95%,62%)]">
            <item.Icon size={18} strokeWidth={2.4} />
          </span>
        </button>
      ))}
    </div>
  );
}

export default SidebarNavigation;
