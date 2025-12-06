import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CashbackCard } from "@/components/CashbackCard";
import { WithdrawModal } from "@/components/WithdrawModal";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cashbackApi, withdrawalsApi, ordersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600 dark:text-amber-400", label: "Pendente" },
  confirmed: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", label: "Confirmado" },
  completed: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", label: "Concluído" },
  rejected: { icon: XCircle, color: "text-red-600 dark:text-red-400", label: "Rejeitado" },
};

export function CashbackPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar cashback
  const { data: cashbackEntries = [], isLoading: loadingCashback } = useQuery({
    queryKey: ["cashback"],
    queryFn: () => cashbackApi.list(),
  });

  // Buscar saques
  const { data: withdrawals = [] } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => withdrawalsApi.list(),
  });

  // Buscar pedidos (para obter informações dos pedidos)
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });

  // Processar histórico de cashback
  const cashbackHistory = useMemo(() => {
    return cashbackEntries.map((entry: any) => {
      const order = orders.find((o: any) => o.id === entry.order_id);
      return {
        id: entry.id.toString(),
        date: new Date(entry.created_at).toLocaleDateString("pt-BR"),
        order: order ? `#${order.id}` : `#${entry.order_id}`,
        supplier: order?.supplier?.legal_name || order?.supplier?.trade_name || "Fornecedor",
        amount: Number(entry.value || 0),
        status: entry.confirmed ? "confirmed" : "pending",
        proofFileUrl: entry.proof_file_url,
      };
    });
  }, [cashbackEntries, orders]);

  // Processar saques
  const processedWithdrawals = useMemo(() => {
    return withdrawals.map((withdrawal: any) => ({
      id: withdrawal.id.toString(),
      date: new Date(withdrawal.created_at).toLocaleDateString("pt-BR"),
      amount: Number(withdrawal.amount || 0),
      pixKey: withdrawal.pix_key ? `${withdrawal.pix_key.slice(0, 3)}***${withdrawal.pix_key.slice(-2)}` : "N/A",
      status: withdrawal.status === "confirmed" ? "completed" : withdrawal.status,
    }));
  }, [withdrawals]);

  // Calcular estatísticas
  const cashbackStats = useMemo(() => {
    const confirmed = cashbackHistory
      .filter((cb) => cb.status === "confirmed")
      .reduce((sum, cb) => sum + cb.amount, 0);
    const pending = cashbackHistory
      .filter((cb) => cb.status === "pending")
      .reduce((sum, cb) => sum + cb.amount, 0);
    const total = cashbackHistory.reduce((sum, cb) => sum + cb.amount, 0);
    return { confirmed, pending, total };
  }, [cashbackHistory]);

  // Processar arquivos de comprovantes
  const proofFiles = useMemo(() => {
    return cashbackHistory
      .filter((cb) => cb.proofFileUrl)
      .map((cb) => ({
        id: cb.id,
        name: `Comprovante_${cb.order}.pdf`,
        type: "pdf" as const,
        size: "N/A",
        uploadedAt: cb.date,
      }));
  }, [cashbackHistory]);

  // Mutation para upload de comprovante
  const uploadProofMutation = useMutation({
    mutationFn: ({ cashbackId, file }: { cashbackId: number; file: File }) =>
      cashbackApi.uploadProof(cashbackId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashback"] });
      toast({
        title: "Comprovante enviado",
        description: "Comprovante enviado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar comprovante",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleUploadProof = (files: File[]) => {
    if (files.length > 0 && cashbackHistory.length > 0) {
      // Assumindo que o primeiro cashback pendente receberá o arquivo
      const pendingCashback = cashbackHistory.find((cb) => cb.status === "pending");
      if (pendingCashback) {
        uploadProofMutation.mutate({
          cashbackId: parseInt(pendingCashback.id),
          file: files[0],
        });
      }
    }
  };

  const handleDownloadProof = (id: string) => {
    const entry = cashbackHistory.find((cb) => cb.id === id);
    if (entry?.proofFileUrl) {
      cashbackApi.downloadProof(parseInt(id)).then((response) => {
        response.blob().then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `comprovante-${id}.pdf`;
          a.click();
        });
      });
    }
  };

  if (loadingCashback) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Meu Cashback</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Meu Cashback</h1>
        <p className="text-muted-foreground">Acompanhe seu saldo e solicite saques</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CashbackCard
          availableBalance={cashbackStats.confirmed}
          pendingBalance={cashbackStats.pending}
          totalEarned={cashbackStats.total}
          onWithdraw={() => setShowWithdrawModal(true)}
        />
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Enviar Comprovantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Envie a DANFE ou foto do orçamento para confirmar seu cashback
            </p>
            <FileUploader
              files={proofFiles}
              onUpload={handleUploadProof}
              onDelete={(id) => {}}
              onDownload={handleDownloadProof}
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history" data-testid="tab-history">Histórico de Cashback</TabsTrigger>
          <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">Saques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {cashbackHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashbackHistory.map((item) => {
                      const config = statusConfig[item.status] || statusConfig.pending;
                      const Icon = config.icon;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="font-medium">{item.order}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>
                            R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span>{config.label}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum cashback registrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <Card>
            <CardContent className="p-0">
              {processedWithdrawals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedWithdrawals.map((item) => {
                      const config = statusConfig[item.status] || statusConfig.pending;
                      const Icon = config.icon;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="font-medium">
                            R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{item.pixKey}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span>{config.label}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum saque realizado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <WithdrawModal
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        availableBalance={cashbackStats.confirmed}
        onWithdraw={(data) => {
          // TODO: Obter store_id do contexto
          const storeId = 1;
          withdrawalsApi.request({
            store_id: storeId,
            pix_key: data.pixKey,
            amount: data.amount,
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
            toast({
              title: "Saque solicitado",
              description: "Sua solicitação de saque foi enviada!",
            });
            setShowWithdrawModal(false);
          }).catch((error: any) => {
            toast({
              title: "Erro ao solicitar saque",
              description: error.message || "Tente novamente",
              variant: "destructive",
            });
          });
        }}
      />
    </div>
  );
}

export default CashbackPage;
