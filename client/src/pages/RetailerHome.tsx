import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CampaignBanner } from "@/components/CampaignBanner";
import { SupplierCard } from "@/components/SupplierCard";
import { CashbackCard } from "@/components/CashbackCard";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart, Package } from "lucide-react";
import { campaignsApi, suppliersApi, cashbackApi, ordersApi } from "@/lib/api";

export function RetailerHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Buscar campanhas ativas
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: () => campaignsApi.list(),
  });

  // Buscar fornecedores
  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => suppliersApi.list(),
  });

  // Buscar cashback
  const { data: cashbackEntries = [] } = useQuery({
    queryKey: ["cashback"],
    queryFn: () => cashbackApi.list(),
  });

  // Buscar pedidos do mês
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });

  // Processar campanhas ativas
  const activeCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns
      .filter((campaign: any) => {
        if (campaign.end_date) {
          const endDate = new Date(campaign.end_date);
          return endDate >= now;
        }
        return true;
      })
      .map((campaign: any) => ({
        id: campaign.id.toString(),
        title: campaign.title,
        supplierName: campaign.supplier?.legal_name || campaign.supplier?.trade_name || "Fornecedor",
        description: campaign.description || "",
        endDate: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString("pt-BR") : "",
        hasGoal: campaign.target_type === "general",
        goalAmount: campaign.target_amount ? Number(campaign.target_amount) : undefined,
        currentAmount: 0, // Seria calculado com base nos pedidos
        minOrderValue: campaign.min_order_value ? Number(campaign.min_order_value) : undefined,
        status: "active" as const,
        imageUrl: campaign.banner_url,
      }));
  }, [campaigns]);

  // Processar fornecedores
  const processedSuppliers = useMemo(() => {
    return suppliers.map((supplier: any) => {
      const supplierCampaigns = campaigns.filter((c: any) => c.supplier?.id === supplier.id);
      
      return {
        id: supplier.id.toString(),
        name: supplier.trade_name || supplier.legal_name || "Fornecedor",
        category: supplier.category || "Sem categoria",
        contactPhone: supplier.contact_phone,
        whatsappNumber: supplier.whatsapp_link?.replace("https://wa.me/", "") || supplier.contact_phone,
        activeCampaigns: supplierCampaigns.length,
      };
    });
  }, [suppliers, campaigns]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(processedSuppliers.map((s: any) => s.category).filter(Boolean));
    return ["Todos", ...Array.from(cats)];
  }, [processedSuppliers]);

  // Calcular estatísticas de cashback
  const cashbackStats = useMemo(() => {
    const confirmed = cashbackEntries
      .filter((cb: any) => cb.confirmed)
      .reduce((sum: number, cb: any) => sum + Number(cb.value || 0), 0);
    const pending = cashbackEntries
      .filter((cb: any) => !cb.confirmed)
      .reduce((sum: number, cb: any) => sum + Number(cb.value || 0), 0);
    const total = cashbackEntries.reduce((sum: number, cb: any) => sum + Number(cb.value || 0), 0);
    return { confirmed, pending, total };
  }, [cashbackEntries]);

  // Calcular pedidos do mês
  const monthlyOrders = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startOfMonth;
    });
  }, [orders]);

  const monthlyTotal = useMemo(() => {
    return monthlyOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
  }, [monthlyOrders]);

  // Filtrar fornecedores
  const filteredSuppliers = useMemo(() => {
    return processedSuppliers.filter((supplier: any) => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || supplier.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [processedSuppliers, searchQuery, selectedCategory]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Ola, bem-vindo!</h1>
        <p className="text-muted-foreground">Confira as campanhas em destaque e faca seus pedidos</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pedidos este Mes"
          value={monthlyOrders.length}
          icon={ShoppingCart}
          subtitle={`R$ ${monthlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em compras`}
        />
        <StatCard
          title="Fornecedores Disponiveis"
          value={suppliers.length}
          icon={Package}
        />
        <div className="md:col-span-1">
          <CashbackCard
            availableBalance={cashbackStats.confirmed}
            pendingBalance={cashbackStats.pending}
            totalEarned={cashbackStats.total}
            onWithdraw={() => {}}
          />
        </div>
      </div>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Campanhas em Destaque</h2>
        {loadingCampaigns ? (
          <p className="text-center text-muted-foreground py-8">Carregando campanhas...</p>
        ) : activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign) => (
              <CampaignBanner
                key={campaign.id}
                {...campaign}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma campanha ativa no momento
          </p>
        )}
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Fornecedores</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-supplier"
            />
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
            <TabsList className="flex-wrap h-auto">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="text-sm"
                  data-testid={`tab-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {loadingSuppliers ? (
          <p className="text-center text-muted-foreground py-8">Carregando fornecedores...</p>
        ) : filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map((supplier: any) => (
              <Link key={supplier.id} href={`/supplier/${supplier.id}`}>
                <SupplierCard
                  {...supplier}
                  onClick={() => {}}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery || selectedCategory !== "Todos" 
              ? "Nenhum fornecedor encontrado com os filtros aplicados"
              : "Nenhum fornecedor cadastrado"}
          </p>
        )}
      </section>
    </div>
  );
}

export default RetailerHome;
