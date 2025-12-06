import { OrderHistoryTable } from "../OrderHistoryTable";

export default function OrderHistoryTableExample() {
  // todo: remove mock functionality
  const mockOrders = [
    {
      id: "1234",
      date: "05/12/2024",
      supplierName: "Distribuidora ABC",
      total: 1250.00,
      status: "delivered" as const,
      isBudgetOnly: false,
      items: [
        { productName: "Refrigerante Cola 2L", quantity: 50, unitPrice: 7.99 },
        { productName: "Agua Mineral Pack c/12", quantity: 20, unitPrice: 18.50 },
        { productName: "Suco Natural 1L", quantity: 30, unitPrice: 12.00 },
      ],
    },
    {
      id: "1235",
      date: "04/12/2024",
      supplierName: "Higiene Total Ltda",
      total: 890.00,
      status: "shipped" as const,
      isBudgetOnly: false,
      notes: "Entregar pela manha",
      items: [
        { productName: "Detergente 500ml", quantity: 100, unitPrice: 2.99 },
        { productName: "Desinfetante 2L", quantity: 50, unitPrice: 8.90 },
      ],
    },
    {
      id: "1236",
      date: "03/12/2024",
      supplierName: "Alimentos Premium",
      total: 2500.00,
      status: "pending" as const,
      isBudgetOnly: true,
      items: [
        { productName: "Azeite Extra Virgem 500ml", quantity: 40, unitPrice: 32.50 },
        { productName: "Massa Gourmet 500g", quantity: 60, unitPrice: 18.00 },
      ],
    },
  ];
  
  return (
    <OrderHistoryTable
      orders={mockOrders}
      onViewOrder={(id) => console.log("View order:", id)}
      onRepeatOrder={(id) => console.log("Repeat order:", id)}
    />
  );
}
