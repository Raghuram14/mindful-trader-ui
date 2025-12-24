import { useState } from "react";
import {
  Home,
  Plus,
  BarChart3,
  History,
  Shield,
  LogOut,
  User,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/auth.context";
import { ProfileSetup } from "@/components/ProfileSetup";

const navItems = [
  { title: "Today", path: "/today", icon: Home },
  { title: "Add Trade", path: "/add-trade", icon: Plus },
  { title: "My Rules", path: "/rules", icon: Shield },
  { title: "Insights", path: "/insights", icon: BarChart3 },
  { title: "History", path: "/history", icon: History },
];

export function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = (): void => {
    logout();
    window.location.href = "/";
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border flex-shrink-0">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Mindful<span className="text-primary">Trade</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Behavioral Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
                  />
                  {item.title}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile & Logout - Fixed at bottom */}
      <div className="p-4 border-t border-sidebar-border space-y-2 flex-shrink-0 mt-auto">
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200 w-full text-left"
        >
          <User className="w-5 h-5 flex-shrink-0" />
          <span>Profile</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Sign out</span>
        </button>
      </div>

      <ProfileSetup open={profileOpen} onOpenChange={setProfileOpen} />
    </aside>
  );
}
