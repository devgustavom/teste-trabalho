import { CampaignBanner } from "../CampaignBanner";

export default function CampaignBannerExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* todo: remove mock functionality */}
      <CampaignBanner
        id="1"
        title="Promocao de Verao"
        supplierName="Distribuidora ABC"
        description="Aproveite descontos especiais em toda linha de bebidas para o verao"
        endDate="15/01/2025"
        hasGoal={true}
        goalAmount={50000}
        currentAmount={32500}
        status="active"
        onClick={() => console.log("Campaign clicked")}
      />
      <CampaignBanner
        id="2"
        title="Festival de Limpeza"
        supplierName="Higiene Total Ltda"
        description="Produtos de limpeza com ate 30% de desconto. Estoque limitado!"
        endDate="20/12/2024"
        hasGoal={false}
        minOrderValue={500}
        status="active"
        onClick={() => console.log("Campaign clicked")}
      />
      <CampaignBanner
        id="3"
        title="Black Friday Antecipada"
        supplierName="Alimentos Premium"
        description="Ofertas exclusivas em toda linha de produtos importados"
        endDate="25/11/2024"
        hasGoal={true}
        goalAmount={100000}
        currentAmount={100000}
        status="ended"
        onClick={() => console.log("Campaign clicked")}
      />
    </div>
  );
}
