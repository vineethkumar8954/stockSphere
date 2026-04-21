import { Bell, Search, User, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function TopBar() {
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border glass-card">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, suppliers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-4 py-2 w-72 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </button>

        <div
          className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer hover:bg-secondary/50 p-1 rounded-lg transition-colors"
          onClick={() => navigate("/settings")}
        >
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{user?.name || "Unknown User"}</p>
            <p className="text-xs text-muted-foreground">Customer</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors tooltip-trigger"
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
