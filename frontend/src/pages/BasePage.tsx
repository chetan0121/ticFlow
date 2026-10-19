import { type ReactNode } from "react";
import BackButton from "../components/buttons/BackButton";
import SidebarButton from "../components/sidebar/SidebarButton";

interface BasePageProps {
  children: ReactNode;
}

function BasePage({ children }: BasePageProps) {
  return (
    <div
      className="flex h-screen min-h-screen w-screen flex-col items-center justify-start overflow-x-hidden"
      style={{
        backgroundImage:
          "var(--ticflow-page-background, linear-gradient(135deg, hsl(18 36% 9%), hsl(34 34% 16%), hsl(48 28% 13%)))",
      }}
    >
      <div className="flex w-full items-center gap-3 px-6 pt-4 pb-3">
        <SidebarButton />
        <BackButton />
      </div>
      <main className="h-full w-full px-10">{children}</main>
    </div>
  );
}

export default BasePage;
