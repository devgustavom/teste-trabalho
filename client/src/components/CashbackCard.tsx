import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Wallet, TrendingUp, Clock, CheckCircle2, ArrowRight } from "lucide-react";

interface CashbackCardProps {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  onWithdraw?: () => void;
}

export function CashbackCard({
  availableBalance,
  pendingBalance,
  totalEarned,
  onWithdraw,
}: CashbackCardProps) {
  return (
    <Card data-testid="card-cashback">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Meu Cashback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-md">
          <p className="text-sm text-muted-foreground">Saldo Disponivel</p>
          <p className="text-3xl font-bold">
            R$ {availableBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          {availableBalance >= 50 && (
            <Button 
              className="mt-3 gap-2" 
              onClick={onWithdraw}
              data-testid="button-withdraw"
            >
              Solicitar Saque
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {availableBalance < 50 && availableBalance > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Minimo para saque: R$ 50,00
            </p>
          )}
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="font-semibold">
                R$ {pendingBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Ganho</p>
              <p className="font-semibold">
                R$ {totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
          <p className="flex items-center gap-1 mb-1">
            <CheckCircle2 className="h-3 w-3" />
            O cashback e confirmado apos a entrega do pedido
          </p>
          <p>Saques sao processados em ate 48 horas uteis via PIX</p>
        </div>
      </CardContent>
    </Card>
  );
}
