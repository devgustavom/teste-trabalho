import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Building2,
  Target,
  Settings,
  LogOut,
  Wallet,
  BarChart3,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

type UserRole = "admin" | "supplier" | "retailer" | "telesales";

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Inicio", icon: Home, href: "/", roles: ["admin", "supplier", "retailer", "telesales"] },
  { title: "Fornecedores", icon: Building2, href: "/suppliers", roles: ["admin", "retailer", "telesales"] },
  { title: "Gerenciar Fornecedores", icon: Building2, href: "/admin-suppliers", roles: ["admin"] },
  { title: "Campanhas", icon: Target, href: "/campaigns", roles: ["admin", "supplier", "retailer", "telesales"] },
  { title: "Produtos", icon: Package, href: "/products", roles: ["admin", "supplier"] },
  { title: "Pedidos Recebidos", icon: ShoppingCart, href: "/supplier-orders", roles: ["supplier"] },
  { title: "Consultar Pedidos", icon: ShoppingCart, href: "/retailer-orders", roles: ["retailer", "telesales"] },
  { title: "Pedidos", icon: ShoppingCart, href: "/orders", roles: ["admin"] },
  { title: "Lojas", icon: Users, href: "/stores", roles: ["admin", "telesales"] },
  { title: "Cashback", icon: Wallet, href: "/cashback", roles: ["retailer"] },
  { title: "Relatorios", icon: BarChart3, href: "/reports", roles: ["admin", "supplier"] },
  { title: "Configuracoes", icon: Settings, href: "/settings", roles: ["admin", "supplier", "retailer"] },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  supplier: "Fornecedor",
  retailer: "Loja",
  telesales: "Televendas",
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  supplier: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  retailer: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  telesales: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName: string;
  companyName?: string;
  onLogout?: () => void;
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  companyName,
  onLogout,
}: DashboardLayoutProps) {
  const [location] = useLocation();
  
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));
  
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  } as React.CSSProperties;
  
  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-md">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-sm truncate">Central de Compras</h1>
                <span className={`text-xs px-2 py-0.5 rounded-md ${roleColors[userRole]}`}>
                  {roleLabels[userRole]}
                </span>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href} data-testid={`nav-${item.href.slice(1) || "home"}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    {companyName && (
                      <p className="text-xs text-muted-foreground truncate">{companyName}</p>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <Link href="/settings">
                  <DropdownMenuItem data-testid="menu-settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuracoes
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} data-testid="menu-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-3 border-b bg-background sticky top-0 z-40">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
