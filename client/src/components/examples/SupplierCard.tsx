import { SupplierCard } from "../SupplierCard";

export default function SupplierCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* todo: remove mock functionality */}
      <SupplierCard
        id="1"
        name="Distribuidora ABC"
        category="Bebidas"
        contactPhone="11999999999"
        whatsappNumber="5511999999999"
        activeCampaigns={2}
        onClick={() => console.log("Supplier clicked")}
      />
      <SupplierCard
        id="2"
        name="Higiene Total Ltda"
        category="Produtos de Limpeza"
        contactPhone="11988888888"
        whatsappNumber="5511988888888"
        activeCampaigns={1}
        onClick={() => console.log("Supplier clicked")}
      />
      <SupplierCard
        id="3"
        name="Alimentos Premium"
        category="Alimentos"
        activeCampaigns={0}
        onClick={() => console.log("Supplier clicked")}
      />
      <SupplierCard
        id="4"
        name="Tech Supplies"
        category="Eletronicos"
        whatsappNumber="5511977777777"
        activeCampaigns={3}
        onClick={() => console.log("Supplier clicked")}
      />
    </div>
  );
}
