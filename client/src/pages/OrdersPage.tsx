import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter"; // Importação adicionada
import { OrderHistoryTable } from "@/components/OrderHistoryTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";
import { ordersApi } from "@/lib/api";

export function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setLocation] = useLocation(); // Hook para navegação
  
  // Buscar pedidos
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });

  // Processar pedidos
  const processedOrders = useMemo(() => {
    return orders.map((order: any) => ({
      id: order.id.toString(),
      date: new Date(order.created_at).toLocaleDateString("pt-BR"),
      supplierName: order.supplier?.legal_name || order.supplier?.trade_name || "Fornecedor",
      total: Number(order.total || 0),
      status: order.status as any,
      isBudgetOnly: order.is_budget || false,
      items: [], // Seria buscado separadamente se necessário
    }));
  }, [orders]);
  
  const filteredOrders = useMemo(() => {
    return processedOrders.filter((order) => {
      const matchesSearch = 
        order.id.includes(searchQuery) || 
        order.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processedOrders, searchQuery, statusFilter]);
  
  if (loadingOrders) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus pedidos</p>
        </div>
        
        {/* CORREÇÃO AQUI: Navegação via onClick em vez de Link envolvendo Button */}
        <Button 
          className="gap-2" 
          data-testid="button-new-order"
          onClick={() => setLocation("/suppliers")}
        >
          <Plus className="h-4 w-4" />
          Novo Pedido
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por numero ou fornecedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-order"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="pending_campaign_goal">Aguardando Meta</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="separated">Separado</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredOrders.length > 0 ? (
        <OrderHistoryTable
          orders={filteredOrders}
          onViewOrder={(id) => {}}
          onRepeatOrder={(id) => {}}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum pedido encontrado
        </div>
      )}
    </div>
  );
}

export default OrdersPage;