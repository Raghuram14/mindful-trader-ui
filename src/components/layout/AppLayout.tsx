import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { CoachButton, CoachPanel } from "@/features/ai-coach/components";
import { useTrades } from "@/context/TradeContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const { trades } = useTrades();

  // Allow AI coach only if user has entered more than 10 trades
  const hasEnoughTrades = trades.length > 10;
  const tradeCount = trades.length;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">{children}</main>
      <MobileNav />

      {/* AI Coach - Always visible but disabled if not enough trades */}
      <CoachButton onClick={() => setIsCoachOpen(true)} />
      <CoachPanel
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        hasEnoughTrades={hasEnoughTrades}
        tradeCount={tradeCount}
      />
    </div>
  );
}
