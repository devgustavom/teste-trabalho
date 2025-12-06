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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Send } from "lucide-react";

interface OrderConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  cashbackAmount: number;
  supplierName: string;
  onConfirm: (data: {
    paymentType: "cash" | "credit";
    isBudgetOnly: boolean;
    notes: string;
  }) => void;
}

export function OrderConfirmModal({
  open,
  onOpenChange,
  total,
  cashbackAmount,
  supplierName,
  onConfirm,
}: OrderConfirmModalProps) {
  const [paymentType, setPaymentType] = useState<"cash" | "credit">("credit");
  const [isBudgetOnly, setIsBudgetOnly] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    onConfirm({ paymentType, isBudgetOnly, notes });
    setTimeout(() => setIsSubmitting(false), 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Pedido</DialogTitle>
          <DialogDescription>
            Pedido para {supplierName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-md">
            <div>
              <p className="text-sm text-muted-foreground">Total do Pedido</p>
              <p className="text-2xl font-bold">
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            {cashbackAmount > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cashback</p>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  + R$ {cashbackAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-base">Forma de Pagamento</Label>
            <RadioGroup 
              value={paymentType} 
              onValueChange={(v) => setPaymentType(v as "cash" | "credit")}
              className="gap-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-md hover-elevate cursor-pointer">
                <RadioGroupItem value="credit" id="credit" data-testid="radio-payment-credit" />
                <Label htmlFor="credit" className="cursor-pointer flex-1">
                  <span className="font-medium">Prazo (Condicoes do Fornecedor)</span>
                  <p className="text-sm text-muted-foreground">Pagamento conforme politica comercial</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-md hover-elevate cursor-pointer">
                <RadioGroupItem value="cash" id="cash" data-testid="radio-payment-cash" />
                <Label htmlFor="cash" className="cursor-pointer flex-1">
                  <span className="font-medium">A Vista</span>
                  <p className="text-sm text-muted-foreground">Pagamento imediato</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-start space-x-3 p-3 border rounded-md">
            <Checkbox 
              id="budget" 
              checked={isBudgetOnly}
              onCheckedChange={(c) => setIsBudgetOnly(c === true)}
              data-testid="checkbox-budget-only"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="budget" className="font-medium cursor-pointer">
                Apenas Orcamento
              </Label>
              <p className="text-sm text-muted-foreground">
                Marque se este pedido e apenas um orcamento, sem compromisso de compra
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              placeholder="Informe pendencias, produtos faltantes, instrucoes de entrega..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="textarea-order-notes"
            />
          </div>
          
          {isBudgetOnly && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                Este pedido sera enviado como orcamento. Nao gera compromisso de compra e nao acumula cashback.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-order"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-2"
            data-testid="button-confirm-order"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Enviar Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
