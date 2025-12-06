import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Percent, ArrowRight } from "lucide-react";

interface OrderTotalizerProps {
  subtotal: number;
  discount?: number;
  cashbackPercent?: number;
  itemCount: number;
  minOrderValue?: number;
  onCheckout?: () => void;
  isSticky?: boolean;
}

export function OrderTotalizer({
  subtotal,
  discount = 0,
  cashbackPercent = 0,
  itemCount,
  minOrderValue,
  onCheckout,
  isSticky = false,
}: OrderTotalizerProps) {
  const total = subtotal - discount;
  const cashbackAmount = (total * cashbackPercent) / 100;
  const meetsMinimum = !minOrderValue || total >= minOrderValue;
  
  const content = (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-md">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{itemCount} item(s) no carrinho</p>
          {minOrderValue && !meetsMinimum && (
            <p className="text-xs text-destructive">
              Pedido minimo: R$ {minOrderValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>
      
      <Separator orientation="vertical" className="h-10 hidden lg:block" />
      <Separator className="lg:hidden" />
      
      <div className="flex flex-wrap items-center gap-6 lg:flex-1">
        <div>
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="font-medium">R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        
        {discount > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Desconto</p>
            <p className="font-medium text-green-600 dark:text-green-400">
              - R$ {discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
        
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        
        {cashbackPercent > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-md">
            <Percent className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-green-700 dark:text-green-300">Cashback {cashbackPercent}%</p>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                + R$ {cashbackAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Button 
        size="lg" 
        className="gap-2 lg:ml-auto"
        onClick={onCheckout}
        disabled={itemCount === 0 || !meetsMinimum}
        data-testid="button-checkout"
      >
        Finalizar Pedido
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
  
  if (isSticky) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg">
        {content}
      </div>
    );
  }
  
  return (
    <Card data-testid="card-order-totalizer">
      <CardContent className="p-4">
        {content}
      </CardContent>
    </Card>
  );
}
