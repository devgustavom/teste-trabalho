import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { OrderHistoryTable } from "@/components/OrderHistoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, Users, Building2, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { ordersApi, storesApi, suppliersApi, reportsApi } from "@/lib/api";

function formatOrdersForTable(orders: any[]) {
  return orders.map((order: any) => ({
    id: order.id.toString(),
    date: new Date(order.created_at).toLocaleDateString("pt-BR"),
    supplierName: order.supplier?.legal_name || order.supplier?.trade_name || "Fornecedor",
    total: Number(order.total || 0),
    status: order.status as any,
    isBudgetOnly: order.is_budget || false,
    items: [], // Seria buscado separadamente se necessário
  }));
}

export function AdminHome() {
  // Buscar pedidos
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });

  // Buscar lojas
  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => storesApi.list(),
  });

  // Buscar fornecedores
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => suppliersApi.list(),
  });

  // Buscar relatório de faturamento
  const { data: revenueReport } = useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => reportsApi.revenue({ group_by: "supplier" }),
  });

  // Calcular estatísticas
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const ordersToday = orders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= today;
    });

    const ordersThisMonth = orders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startOfMonth;
    });

    const monthlyRevenue = ordersThisMonth.reduce(
      (sum: number, order: any) => sum + Number(order.total || 0),
      0
    );

    return {
      ordersToday: ordersToday.length,
      monthlyRevenue,
      totalStores: stores.length,
      totalSuppliers: suppliers.length,
    };
  }, [orders, stores, suppliers]);

  // Processar top fornecedores
  const topSuppliers = useMemo(() => {
    if (!revenueReport?.grouped) return [];
    
    return revenueReport.grouped
      .sort((a: any, b: any) => Number(b.totalRevenue) - Number(a.totalRevenue))
      .slice(0, 3)
      .map((item: any, idx: number) => ({
        name: item.name,
        orders: 0, // Seria calculado separadamente
        revenue: Number(item.totalRevenue),
        rank: idx + 1,
      }));
  }, [revenueReport]);

  // Processar top lojas
  const topStores = useMemo(() => {
    // Agrupar pedidos por loja
    const storeStats: Record<number, { name: string; orders: number; total: number }> = {};
    
    orders.forEach((order: any) => {
      const storeId = order.store?.id;
      if (storeId) {
        if (!storeStats[storeId]) {
          storeStats[storeId] = {
            name: order.store?.name || "Loja",
            orders: 0,
            total: 0,
          };
        }
        storeStats[storeId].orders += 1;
        storeStats[storeId].total += Number(order.total || 0);
      }
    });

    return Object.values(storeStats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
  }, [orders]);

  // Pedidos recentes
  const recentOrders = useMemo(() => {
    return formatOrdersForTable(orders.slice(0, 5).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma Central de Compras</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/stores">
            <Button className="gap-2" data-testid="button-new-store">
              <Plus className="h-4 w-4" />
              Nova Loja
            </Button>
          </Link>
          <Link href="/admin-suppliers">
            <Button variant="outline" className="gap-2" data-testid="button-new-supplier">
              <Building2 className="h-4 w-4" />
              Novo Fornecedor
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pedidos Hoje"
          value={stats.ordersToday}
          icon={ShoppingCart}
        />
        <StatCard
          title="Faturamento Mensal"
          value={`R$ ${stats.monthlyRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <StatCard
          title="Lojas Ativas"
          value={stats.totalStores}
          icon={Users}
        />
        <StatCard
          title="Fornecedores"
          value={stats.totalSuppliers}
          icon={Building2}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOrders ? (
                <div className="p-8 text-center text-muted-foreground">
                  Carregando pedidos...
                </div>
              ) : recentOrders.length > 0 ? (
                <OrderHistoryTable
                  orders={recentOrders}
                  onViewOrder={(id) => {}}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum pedido encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Fornecedores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSuppliers.length > 0 ? (
                topSuppliers.map((supplier) => (
                  <div 
                    key={supplier.name} 
                    className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                        {supplier.rank}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.orders} pedidos</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      R$ {(supplier.revenue / 1000).toFixed(0)}k
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sem dados de faturamento
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Lojas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topStores.length > 0 ? (
                topStores.map((store) => (
                  <div 
                    key={store.name} 
                    className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm flex items-center justify-center font-medium">
                        {store.rank}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{store.name}</p>
                        <p className="text-xs text-muted-foreground">{store.orders} pedidos</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      R$ {(store.total / 1000).toFixed(1)}k
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma loja com pedidos
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
