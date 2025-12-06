import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, Package, Truck } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { ordersApi, ordersApi as api } from "@/lib/api";

interface Order {
  id: string;
  date: string;
  supplierName: string;
  storeName: string;
  total: number;
  status: "pending" | "confirmed" | "separated" | "shipped" | "delivered" | "cancelled";
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  isBudgetOnly: boolean;
  notes?: string;
}

export function SupplierOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      storeName: order.store?.name || "Loja",
      total: Number(order.total || 0),
      status: order.status as any,
      isBudgetOnly: order.is_budget || false,
      notes: order.notes,
      items: [], // Seria buscado separadamente
      orderData: order, // Manter dados originais
    }));
  }, [orders]);

  // Filtrar pedidos
  const filteredOrders = useMemo(() => {
    return processedOrders.filter((order) => {
      const matchesSearch = 
        order.id.includes(searchQuery) || 
        order.storeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processedOrders, searchQuery, statusFilter]);

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      ordersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Status atualizado",
        description: `Pedido #${selectedOrder?.id} atualizado com sucesso`,
      });
      setShowStatusDialog(false);
      setSelectedOrder(null);
      setNewStatus("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusDialog(true);
  };

  const confirmStatusUpdate = () => {
    if (!selectedOrder) return;
    
    const orderData = processedOrders.find((o) => o.id === selectedOrder.id)?.orderData;
    if (!orderData) return;

    updateStatusMutation.mutate({
      orderId: orderData.id,
      status: newStatus,
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      separated: "Separado",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
      pending_campaign_goal: "Aguardando Meta",
    };
    return labels[status] || status;
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
      case "confirmed":
      case "pending_campaign_goal":
        return [
          { value: "separated", label: "Separado", icon: Package },
          { value: "shipped", label: "Enviado", icon: Truck },
        ];
      case "separated":
        return [
          { value: "shipped", label: "Enviado", icon: Truck },
        ];
      case "shipped":
        return [
          { value: "delivered", label: "Entregue", icon: Package },
        ];
      default:
        return [];
    }
  };

  if (loadingOrders) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Pedidos Recebidos</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Pedidos Recebidos</h1>
        <p className="text-muted-foreground">Visualize e gerencie os pedidos recebidos das lojas</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou loja..."
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
      
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const nextOptions = getNextStatusOptions(order.status);
            return (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover-elevate"
                data-testid={`card-order-${order.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">Pedido #{order.id}</h3>
                      <StatusBadge status={order.status} size="sm" />
                      {order.isBudgetOnly && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Orçamento
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Loja:</span> {order.storeName}
                      </div>
                      <div>
                        <span className="font-medium">Data:</span> {order.date}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span>{" "}
                        <span className="font-semibold text-foreground">
                          R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    {order.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Observações:</span> {order.notes}
                      </div>
                    )}
                  </div>
                  
                  {nextOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {nextOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <Button
                            key={option.value}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(option.value);
                              setShowStatusDialog(true);
                            }}
                            data-testid={`button-update-status-${option.value}-${order.id}`}
                          >
                            <Icon className="h-4 w-4" />
                            Marcar como {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pedido encontrado
          </div>
        )}
      </div>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status do Pedido</DialogTitle>
            <DialogDescription>
              Confirme a atualização do status do pedido #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Status atual:</span>
              {selectedOrder && <StatusBadge status={selectedOrder.status} />}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Novo status:</span>
              <StatusBadge status={newStatus as any} />
            </div>
            {selectedOrder && (
              <div className="text-sm text-muted-foreground">
                <p>Loja: {selectedOrder.storeName}</p>
                <p>Total: R$ {selectedOrder.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmStatusUpdate} 
              data-testid="button-confirm-status-update"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Atualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SupplierOrdersPage;
