import { Home, Package, DollarSign, ShoppingCart, FolderOpen, Truck, Users, BarChart3, Bell, Settings, LifeBuoy } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Sales", url: "/sales", icon: DollarSign },
  { title: "Purchases", url: "/purchases", icon: ShoppingCart },
  { title: "Categories", url: "/categories", icon: FolderOpen },
  { title: "Suppliers", url: "/suppliers", icon: Truck },
];

const systemItems = [
  { title: "Support", url: "/support", icon: LifeBuoy },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const visibleSystemItems = systemItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0 glow-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display text-lg font-bold text-sidebar-accent-foreground tracking-tight">StockSphere</h1>
              <p className="text-xs text-sidebar-foreground">Inventory Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive(item.url)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                      activeClassName=""
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</p>}
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleSystemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive(item.url)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                      activeClassName=""
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
