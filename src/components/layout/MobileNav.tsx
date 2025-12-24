import { Home, Plus, BarChart3, History } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { title: 'Today', path: '/today', icon: Home },
  { title: 'Add', path: '/add-trade', icon: Plus },
  { title: 'Insights', path: '/insights', icon: BarChart3 },
  { title: 'History', path: '/history', icon: History },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50">
      <ul className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-sidebar-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
