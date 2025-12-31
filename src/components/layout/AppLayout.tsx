import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { CoachButton, CoachPanel } from "@/features/ai-coach/components";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">{children}</main>
      <MobileNav />

      {/* AI Coach - Available globally */}
      <CoachButton onClick={() => setIsCoachOpen(true)} />
      <CoachPanel isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} />
    </div>
  );
}
