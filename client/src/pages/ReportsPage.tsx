import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, Calendar, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { reportsApi, ordersApi, suppliersApi, storesApi } from "@/lib/api";

export function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTab, setSelectedTab] = useState("orders");

  // Calcular datas padrão (últimos 30 dias)
  const defaultStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }, []);

  const defaultEndDate = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || defaultEndDate;

  // Buscar relatório de pedidos
  const { data: ordersReport, isLoading: loadingOrders } = useQuery({
    queryKey: ["reports", "orders", effectiveStartDate, effectiveEndDate],
    queryFn: () => reportsApi.orders({
      start_date: effectiveStartDate,
      end_date: effectiveEndDate,
    }),
  });

  // Buscar relatório de faturamento
  const { data: revenueReport, isLoading: loadingRevenue } = useQuery({
    queryKey: ["reports", "revenue", effectiveStartDate, effectiveEndDate],
    queryFn: () => reportsApi.revenue({
      start_date: effectiveStartDate,
      end_date: effectiveEndDate,
      group_by: "supplier",
    }),
  });

  // Buscar relatório de cashback
  const { data: cashbackReport, isLoading: loadingCashback } = useQuery({
    queryKey: ["reports", "cashback", effectiveStartDate, effectiveEndDate],
    queryFn: () => reportsApi.cashback({
      start_date: effectiveStartDate,
      end_date: effectiveEndDate,
    }),
  });

  const handleExport = (type: string) => {
    // TODO: Implementar exportação
    console.log("Exportar", type);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Análise de pedidos, faturamento e cashback</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("all")}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder={defaultStartDate}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder={defaultEndDate}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="h-4 w-4 mr-2" />
            Faturamento
          </TabsTrigger>
          <TabsTrigger value="cashback">
            <TrendingUp className="h-4 w-4 mr-2" />
            Cashback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : ordersReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                        <p className="text-2xl font-bold">{ordersReport.totalOrders || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-2xl font-bold">
                          R$ {(ordersReport.totalValue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Ticket Médio</p>
                        <p className="text-2xl font-bold">
                          R$ {ordersReport.totalOrders > 0 
                            ? (ordersReport.totalValue / ordersReport.totalOrders).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                            : "0,00"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {ordersReport.ordersByStatus && Object.keys(ordersReport.ordersByStatus).length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Pedidos por Status</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Valor Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(ordersReport.ordersByStatus).map(([status, data]: [string, any]) => (
                            <TableRow key={status}>
                              <TableCell className="font-medium">{status}</TableCell>
                              <TableCell>{data.count || 0}</TableCell>
                              <TableCell>
                                R$ {(data.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRevenue ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : revenueReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Faturamento Total</p>
                        <p className="text-2xl font-bold">
                          R$ {(revenueReport.totalRevenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Número de Transações</p>
                        <p className="text-2xl font-bold">{revenueReport.totalTransactions || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {revenueReport.grouped && revenueReport.grouped.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Faturamento por Fornecedor</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Pedidos</TableHead>
                            <TableHead>Faturamento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenueReport.grouped.map((item: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{item.name || "N/A"}</TableCell>
                              <TableCell>{item.orders || 0}</TableCell>
                              <TableCell>
                                R$ {(item.totalRevenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Cashback</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCashback ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : cashbackReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Cashback Total</p>
                        <p className="text-2xl font-bold">
                          R$ {(cashbackReport.totalCashback || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Confirmado</p>
                        <p className="text-2xl font-bold">
                          R$ {(cashbackReport.confirmedCashback || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Pendente</p>
                        <p className="text-2xl font-bold">
                          R$ {(cashbackReport.pendingCashback || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportsPage;

