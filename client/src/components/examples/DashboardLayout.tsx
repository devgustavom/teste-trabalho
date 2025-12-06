import { DashboardLayout } from "../DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLayoutExample() {
  return (
    <DashboardLayout
      userRole="retailer"
      userName="Joao Silva"
      companyName="Mercado do Joao"
      onLogout={() => console.log("Logout clicked")}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Bem-vindo ao Dashboard</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Este e o layout principal do dashboard com navegacao lateral.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
