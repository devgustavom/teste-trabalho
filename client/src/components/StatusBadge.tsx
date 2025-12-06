import { Badge } from "@/components/ui/badge";

type OrderStatus = "pending" | "confirmed" | "separated" | "shipped" | "delivered" | "cancelled";
type CampaignStatus = "active" | "ended" | "upcoming" | "goal_reached" | "goal_not_reached";

interface StatusBadgeProps {
  status: OrderStatus | CampaignStatus;
  size?: "sm" | "default";
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  separated: { label: "Separado", variant: "default" },
  shipped: { label: "Enviado", variant: "default" },
  delivered: { label: "Entregue", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  active: { label: "Ativa", variant: "default" },
  ended: { label: "Encerrada", variant: "secondary" },
  upcoming: { label: "Em breve", variant: "outline" },
  goal_reached: { label: "Meta atingida", variant: "default" },
  goal_not_reached: { label: "Meta nao atingida", variant: "destructive" },
};

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  
  return (
    <Badge 
      variant={config.variant}
      className={size === "sm" ? "text-xs" : ""}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
