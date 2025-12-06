import { OrderTotalizer } from "../OrderTotalizer";

export default function OrderTotalizerExample() {
  return (
    <div className="space-y-6">
      {/* todo: remove mock functionality */}
      <OrderTotalizer
        subtotal={1250.00}
        discount={125.00}
        cashbackPercent={5}
        itemCount={8}
        onCheckout={() => console.log("Checkout clicked")}
      />
      <OrderTotalizer
        subtotal={350.00}
        cashbackPercent={3}
        itemCount={3}
        minOrderValue={500}
        onCheckout={() => console.log("Checkout clicked")}
      />
    </div>
  );
}
