import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Eye, Download, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ordersApi } from "@/lib/api";

interface Order {
  id: string;
  date: string;
  supplierName: string;
  total: number;
  status: "pending" | "confirmed" | "separated" | "shipped" | "delivered" | "cancelled";
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  isBudgetOnly: boolean;
  paymentType?: string;
  notes?: string;
  orderData?: any;
}

export function RetailerOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  
  // Buscar pedidos
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });

  // Buscar itens dos pedidos quando necessário
  const { data: orderItemsMap = {} } = useQuery({
    queryKey: ["order-items"],
    queryFn: async () => {
      const itemsMap: Record<number, any[]> = {};
      for (const order of orders) {
        try {
          const items = await ordersApi.getItems(order.id);
          itemsMap[order.id] = items;
        } catch (error) {
          itemsMap[order.id] = [];
        }
      }
      return itemsMap;
    },
    enabled: orders.length > 0,
  });

  // Processar pedidos
  const processedOrders = useMemo(() => {
    return orders.map((order: any) => {
      const items = orderItemsMap[order.id] || [];
      return {
        id: order.id.toString(),
        date: new Date(order.created_at).toLocaleDateString("pt-BR"),
        supplierName: order.supplier?.legal_name || order.supplier?.trade_name || "Fornecedor",
        total: Number(order.total || 0),
        status: order.status as any,
        isBudgetOnly: order.is_budget || false,
        paymentType: order.payment_type,
        notes: order.notes,
        items: items.map((item: any) => ({
          productName: item.product?.name || "Produto",
          quantity: item.quantity,
          unitPrice: Number(item.unit_price || 0),
        })),
        orderData: order,
      };
    });
  }, [orders, orderItemsMap]);

  // Filtrar pedidos
  const filteredOrders = useMemo(() => {
    return processedOrders.filter((order) => {
      const matchesSearch = 
        order.id.includes(searchQuery) || 
        order.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processedOrders, searchQuery, statusFilter]);

  const handleViewOrder = (orderId: string) => {
    const order = processedOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDialog(true);
    }
  };

  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = filteredOrders.filter(o => 
    o.status === "pending" || o.status === "separated" || o.status === "shipped"
  ).length;

  if (loadingOrders) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Consultar Pedidos</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Consultar Pedidos</h1>
        <p className="text-muted-foreground">Acompanhe o status e detalhes dos seus pedidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
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
          onViewOrder={handleViewOrder}
          onRepeatOrder={(id) => {}}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum pedido encontrado
        </div>
      )}

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes do Pedido #{selectedOrder?.id}
              {selectedOrder && <StatusBadge status={selectedOrder.status} />}
            </DialogTitle>
            <DialogDescription>
              Informações completas do pedido
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Fornecedor:</span>
                  <p className="font-semibold">{selectedOrder.supplierName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Data:</span>
                  <p className="font-semibold">{selectedOrder.date}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Forma de Pagamento:</span>
                  <p className="font-semibold">{selectedOrder.paymentType || "Não informado"}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Tipo:</span>
                  <Badge variant={selectedOrder.isBudgetOnly ? "secondary" : "default"}>
                    {selectedOrder.isBudgetOnly ? "Orçamento" : "Pedido"}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                {selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                      <span>Produto</span>
                      <span className="text-center">Quantidade</span>
                      <span className="text-right">Preço Unit.</span>
                      <span className="text-right">Subtotal</span>
                    </div>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-2 text-sm py-2 border-b last:border-0">
                        <span>{item.productName}</span>
                        <span className="text-center">{item.quantity}</span>
                        <span className="text-right">
                          R$ {item.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-right font-semibold">
                          R$ {(item.quantity * item.unitPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Carregando itens...</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>R$ {selectedOrder.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Observações</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              // Função para baixar/exportar pedido
              console.log("Download order:", selectedOrder?.id);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RetailerOrdersPage;
