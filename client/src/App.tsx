import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoginPage } from "@/components/LoginPage";
import { useState, useEffect } from "react";

import RetailerHome from "@/pages/RetailerHome";
import SupplierHome from "@/pages/SupplierHome";
import AdminHome from "@/pages/AdminHome";
import SupplierDetail from "@/pages/SupplierDetail";
import OrdersPage from "@/pages/OrdersPage";
import CashbackPage from "@/pages/CashbackPage";
import StoresPage from "@/pages/StoresPage";
import ProductsPage from "@/pages/ProductsPage";
import CampaignsPage from "@/pages/CampaignsPage";
import SupplierOrdersPage from "@/pages/SupplierOrdersPage";
import SuppliersByCategoryPage from "@/pages/SuppliersByCategoryPage";
import RetailerOrdersPage from "@/pages/RetailerOrdersPage";
import CampaignProductsPage from "@/pages/CampaignProductsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import SuppliersPage from "@/pages/SuppliersPage";

type UserRole = "admin" | "supplier" | "retailer" | "telesales";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("retailer");
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Verificar se há token salvo ao carregar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(user.role || "retailer");
        setUserName(user.name || user.email || "");
        setCompanyName(user.company_name || user.store?.name || user.supplier?.trade_name || "");
      } catch (error) {
        // Se houver erro ao parsear, limpar e fazer logout
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole("retailer");
    setUserName("");
    setCompanyName("");
  };

  const handleLogin = (user: any, token: string) => {
    setIsLoggedIn(true);
    setUserRole(user.role || "retailer");
    setUserName(user.name || user.email || "");
    setCompanyName(user.company_name || user.store?.name || user.supplier?.trade_name || "");
  };

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <LoginPage onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  const getHomePage = () => {
    switch (userRole) {
      case "admin":
        return <AdminHome />;
      case "supplier":
        return <SupplierHome />;
      case "retailer":
      case "telesales":
      default:
        return <RetailerHome />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <DashboardLayout
          userRole={userRole}
          userName={userName}
          companyName={companyName}
          onLogout={handleLogout}
        >
          <Switch>
            <Route path="/">{getHomePage()}</Route>
            <Route path="/admin" component={AdminHome} />
            <Route path="/supplier" component={SupplierHome} />
            <Route path="/supplier/:id" component={SupplierDetail} />
            <Route path="/orders" component={OrdersPage} />
            <Route path="/supplier-orders" component={SupplierOrdersPage} />
            <Route path="/retailer-orders" component={RetailerOrdersPage} />
            <Route path="/suppliers" component={SuppliersByCategoryPage} />
            <Route path="/admin-suppliers" component={SuppliersPage} />
            <Route path="/campaign/:id/products" component={CampaignProductsPage} />
            <Route path="/cashback" component={CashbackPage} />
            <Route path="/stores" component={StoresPage} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/campaigns" component={CampaignsPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </DashboardLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
