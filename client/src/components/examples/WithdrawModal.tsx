import { useState } from "react";
import { WithdrawModal } from "../WithdrawModal";
import { Button } from "@/components/ui/button";

export default function WithdrawModalExample() {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Abrir Modal de Saque</Button>
      {/* todo: remove mock functionality */}
      <WithdrawModal
        open={open}
        onOpenChange={setOpen}
        availableBalance={245.80}
        onConfirm={(data) => {
          console.log("Withdraw confirmed:", data);
          setOpen(false);
        }}
      />
    </div>
  );
}
