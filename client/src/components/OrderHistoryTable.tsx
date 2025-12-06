import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StatusBadge } from "./StatusBadge";
import { ChevronDown, ChevronUp, Eye, Repeat } from "lucide-react";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  date: string;
  supplierName: string;
  total: number;
  status: "pending" | "confirmed" | "separated" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  isBudgetOnly: boolean;
  notes?: string;
}

interface OrderHistoryTableProps {
  orders: Order[];
  onViewOrder?: (orderId: string) => void;
  onRepeatOrder?: (orderId: string) => void;
  showSupplier?: boolean;
}

export function OrderHistoryTable({
  orders,
  onViewOrder,
  onRepeatOrder,
  showSupplier = true,
}: OrderHistoryTableProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  const toggleExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };
  
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum pedido encontrado</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Historico de Pedidos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Data</TableHead>
              {showSupplier && <TableHead>Fornecedor</TableHead>}
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <Collapsible key={order.id} asChild open={isExpanded}>
                  <>
                    <TableRow 
                      className="hover-elevate cursor-pointer"
                      onClick={() => toggleExpand(order.id)}
                      data-testid={`row-order-${order.id}`}
                    >
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button size="icon" variant="ghost">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">
                        #{order.id}
                        {order.isBudgetOnly && (
                          <span className="text-xs text-muted-foreground ml-2">(Orcamento)</span>
                        )}
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      {showSupplier && <TableCell>{order.supplierName}</TableCell>}
                      <TableCell className="font-medium">
                        R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onViewOrder?.(order.id)}
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onRepeatOrder?.(order.id)}
                            data-testid={`button-repeat-order-${order.id}`}
                          >
                            <Repeat className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={showSupplier ? 7 : 6} className="p-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
                              <span>Produto</span>
                              <span className="text-center">Qtd</span>
                              <span className="text-right">Subtotal</span>
                            </div>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="grid grid-cols-3 gap-4 text-sm">
                                <span>{item.productName}</span>
                                <span className="text-center">{item.quantity}</span>
                                <span className="text-right">
                                  R$ {(item.quantity * item.unitPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                            {order.notes && (
                              <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Obs:</span> {order.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
