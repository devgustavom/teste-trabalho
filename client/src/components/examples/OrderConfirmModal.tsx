import { useState } from "react";
import { OrderConfirmModal } from "../OrderConfirmModal";
import { Button } from "@/components/ui/button";

export default function OrderConfirmModalExample() {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Abrir Modal de Confirmacao</Button>
      {/* todo: remove mock functionality */}
      <OrderConfirmModal
        open={open}
        onOpenChange={setOpen}
        total={1125.00}
        cashbackAmount={56.25}
        supplierName="Distribuidora ABC"
        onConfirm={(data) => {
          console.log("Order confirmed:", data);
          setOpen(false);
        }}
      />
    </div>
  );
}
