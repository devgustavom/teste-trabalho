import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { AlertCircle, Wallet } from "lucide-react";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  onConfirm: (data: {
    amount: number;
    pixKeyType: string;
    pixKey: string;
  }) => void;
}

export function WithdrawModal({
  open,
  onOpenChange,
  availableBalance,
  onConfirm,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState(availableBalance);
  const [pixKeyType, setPixKeyType] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isValid = amount >= 50 && amount <= availableBalance && pixKeyType && pixKey;
  
  const handleSubmit = () => {
    if (!isValid) return;
    setIsSubmitting(true);
    onConfirm({ amount, pixKeyType, pixKey });
    setTimeout(() => setIsSubmitting(false), 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solicitar Saque
          </DialogTitle>
          <DialogDescription>
            Informe o valor e sua chave PIX para receber o saque
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-md text-center">
            <p className="text-sm text-muted-foreground">Saldo Disponivel</p>
            <p className="text-2xl font-bold">
              R$ {availableBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Saque</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min={50}
              max={availableBalance}
              step={0.01}
              data-testid="input-withdraw-amount"
            />
            <p className="text-xs text-muted-foreground">Minimo: R$ 50,00</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pixType">Tipo de Chave PIX</Label>
            <Select value={pixKeyType} onValueChange={setPixKeyType}>
              <SelectTrigger data-testid="select-pix-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="random">Chave Aleatoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder={
                pixKeyType === "cpf" ? "000.000.000-00" :
                pixKeyType === "cnpj" ? "00.000.000/0000-00" :
                pixKeyType === "email" ? "email@exemplo.com" :
                pixKeyType === "phone" ? "(00) 00000-0000" :
                "Chave aleatoria"
              }
              data-testid="input-pix-key"
            />
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Importante</p>
              <p>Verifique se a chave PIX esta correta. Saques sao processados em ate 48 horas uteis.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-withdraw"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            data-testid="button-confirm-withdraw"
          >
            {isSubmitting ? "Processando..." : "Confirmar Saque"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
