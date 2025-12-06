import { StatCard } from "../StatCard";
import { ShoppingCart, DollarSign, Users, Package } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Pedidos Hoje"
        value={42}
        icon={ShoppingCart}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Faturamento"
        value="R$ 45.230"
        icon={DollarSign}
        trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Lojas Ativas"
        value={128}
        icon={Users}
        subtitle="De 150 cadastradas"
      />
      <StatCard
        title="Produtos"
        value={1.234}
        icon={Package}
      />
    </div>
  );
}
