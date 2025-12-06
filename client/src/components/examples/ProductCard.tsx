import { ProductCard } from "../ProductCard";

export default function ProductCardExample() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* todo: remove mock functionality */}
      <ProductCard
        id="1"
        name="Refrigerante Cola 2L"
        description="Bebida gaseificada sabor cola"
        price={7.99}
        originalPrice={9.99}
        stock={150}
        unit="unidades"
        onQuantityChange={(qty) => console.log(`Quantity changed to ${qty}`)}
      />
      <ProductCard
        id="2"
        name="Agua Mineral 500ml Pack c/12"
        price={18.50}
        stock={80}
        unit="packs"
        onQuantityChange={(qty) => console.log(`Quantity changed to ${qty}`)}
      />
      <ProductCard
        id="3"
        name="Detergente Neutro 500ml"
        description="Limpeza eficiente para loucas"
        price={2.99}
        stock={0}
        unit="unidades"
        onQuantityChange={(qty) => console.log(`Quantity changed to ${qty}`)}
      />
      <ProductCard
        id="4"
        name="Arroz Tipo 1 5kg"
        description="Arroz agulhinha premium"
        price={24.90}
        originalPrice={29.90}
        stock={45}
        unit="pacotes"
        initialQuantity={2}
        onQuantityChange={(qty) => console.log(`Quantity changed to ${qty}`)}
      />
    </div>
  );
}
