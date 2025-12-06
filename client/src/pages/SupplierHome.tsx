import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { OrderHistoryTable } from "@/components/OrderHistoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, Package, Target, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { ordersApi, campaignsApi, productsApi } from "@/lib/api";

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

export function SupplierHome() {
  // Buscar pedidos
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });

  // Buscar campanhas
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => campaignsApi.list(),
  });

  // Buscar produtos
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list(),
  });

  // Processar estatísticas
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

    const activeCampaigns = campaigns.filter((campaign: any) => {
      if (campaign.end_date) {
        return new Date(campaign.end_date) >= now;
      }
      return true;
    });

    const lowStockProducts = products.filter((p: any) => Number(p.stock || 0) < 10);

    return {
      ordersToday: ordersToday.length,
      monthlyRevenue,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      activeCampaigns: activeCampaigns.length,
    };
  }, [orders, campaigns, products]);

  // Processar campanhas para exibição
  const processedCampaigns = useMemo(() => {
    return campaigns.slice(0, 5).map((campaign: any) => {
      const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
      const now = new Date();
      const isActive = !endDate || endDate >= now;
      
      // Calcular progresso (seria calculado com base nos pedidos)
      let progress = 0;
      if (campaign.target_type === "general" && campaign.target_amount) {
        // Aqui seria calculado com base nos pedidos da campanha
        progress = 0;
      }

      return {
        id: campaign.id.toString(),
        name: campaign.title,
        status: isActive ? "active" : "ended",
        progress,
        endDate: endDate ? endDate.toLocaleDateString("pt-BR") : "",
      };
    });
  }, [campaigns]);

  // Processar pedidos recentes
  const recentOrders = useMemo(() => {
    return formatOrdersForTable(orders.slice(0, 5));
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dashboard do Fornecedor</h1>
          <p className="text-muted-foreground">Gerencie seus produtos, campanhas e pedidos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/products">
            <Button className="gap-2" data-testid="button-new-product">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
          <Link href="/campaigns">
            <Button variant="outline" className="gap-2" data-testid="button-new-campaign">
              <Target className="h-4 w-4" />
              Nova Campanha
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
          title="Produtos Ativos"
          value={stats.totalProducts}
          icon={Package}
          subtitle={stats.lowStockCount > 0 ? `${stats.lowStockCount} com baixo estoque` : undefined}
        />
        <StatCard
          title="Campanhas Ativas"
          value={stats.activeCampaigns}
          icon={Target}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
              <Link href="/supplier-orders">
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
                  showSupplier={false}
                  onViewOrder={(id) => {}}
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum pedido recebido ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Minhas Campanhas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCampaigns ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Carregando campanhas...
                </p>
              ) : processedCampaigns.length > 0 ? (
                <>
                  {processedCampaigns.map((campaign) => (
                    <div 
                      key={campaign.id} 
                      className="p-3 border rounded-md hover-elevate cursor-pointer"
                      data-testid={`card-campaign-${campaign.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          campaign.status === "active" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {campaign.status === "active" ? "Ativa" : "Encerrada"}
                        </span>
                      </div>
                      {campaign.endDate && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progresso: {campaign.progress}%</span>
                          <span>Até {campaign.endDate}</span>
                        </div>
                      )}
                      {campaign.progress > 0 && (
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma campanha cadastrada
                </p>
              )}
              
              <Link href="/campaigns">
                <Button variant="outline" className="w-full gap-2" data-testid="button-manage-campaigns">
                  Gerenciar Campanhas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SupplierHome;
