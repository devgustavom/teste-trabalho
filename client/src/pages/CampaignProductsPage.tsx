import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { CampaignBanner } from "@/components/CampaignBanner";
import { OrderTotalizer } from "@/components/OrderTotalizer";
import { OrderConfirmModal } from "@/components/OrderConfirmModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { campaignsApi, productsApi, ordersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export function CampaignProductsPage() {
  const [, params] = useRoute("/campaign/:id/products");
  const campaignId = params?.id ? parseInt(params.id) : null;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Buscar campanha
  const { data: campaign, isLoading: loadingCampaign } = useQuery({
    queryKey: ["campaigns", campaignId],
    queryFn: () => campaignsApi.get(campaignId!),
    enabled: !!campaignId,
  });

  // Buscar produtos da campanha (através da campanha)
  const { data: campaignData } = useQuery({
    queryKey: ["campaigns", campaignId],
    queryFn: () => campaignsApi.get(campaignId!),
    enabled: !!campaignId,
  });

  // Buscar todos os produtos (para obter detalhes)
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list(),
  });

  // Processar produtos da campanha
  const processedProducts = useMemo(() => {
    if (!campaignData?.products) return [];
    const productIds = campaignData.products.map((cp: any) => cp.product_id || cp.product?.id);
    return allProducts
      .filter((p: any) => productIds.includes(p.id))
      .map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: Number(product.price || 0),
        stock: Number(product.stock || 0),
        unit: "unidade",
        imageUrl: product.image_url,
      }));
  }, [campaignData, allProducts]);

  // Processar campanha
  const processedCampaign = useMemo(() => {
    if (!campaign) return null;
    
    return {
      id: campaign.id.toString(),
      title: campaign.title,
      supplierName: campaign.supplier?.legal_name || campaign.supplier?.trade_name || "Fornecedor",
      description: campaign.description || "",
      endDate: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString("pt-BR") : "",
      hasGoal: campaign.target_type === "general",
      goalAmount: campaign.target_amount ? Number(campaign.target_amount) : undefined,
      currentAmount: 0, // Seria calculado
      minOrderValue: campaign.min_order_value ? Number(campaign.min_order_value) : undefined,
      status: "active" as const,
      imageUrl: campaign.banner_url,
    };
  }, [campaign]);

  const handleQuantityChange = (productId: string, qty: number, price: number, name: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (qty === 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: qty } : item
        );
      }
      return [...prev, { productId, quantity: qty, price, name }];
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cashbackPercent = 5; // Mock - viria das condições regionais

  // Mutation para criar pedido
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => ordersApi.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Pedido criado",
        description: "Seu pedido foi enviado com sucesso!",
      });
      setCart([]);
      setShowConfirmModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar pedido",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleConfirmOrder = (data: { paymentType: string; isBudget: boolean; notes?: string }) => {
    if (!campaignId || !campaign) return;

    // TODO: Obter store_id e supplier_id do contexto
    const storeId = 1;
    const supplierId = campaign.supplier?.id;

    const orderData = {
      store_id: storeId,
      supplier_id: supplierId,
      campaign_id: campaignId,
      payment_type: data.paymentType,
      is_budget: data.isBudget,
      notes: data.notes,
      items: cart.map(item => ({
        product_id: parseInt(item.productId),
        quantity: item.quantity,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  if (loadingCampaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando campanha...</p>
      </div>
    );
  }

  if (!processedCampaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Campanha não encontrada</p>
        <Link href="/">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold mb-2">Produtos da Campanha</h1>
          <p className="text-muted-foreground">Confira os produtos em promoção</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campanha: {processedCampaign.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignBanner
            id={processedCampaign.id}
            title={processedCampaign.title}
            supplierName={processedCampaign.supplierName}
            description={processedCampaign.description}
            endDate={processedCampaign.endDate}
            hasGoal={processedCampaign.hasGoal}
            goalAmount={processedCampaign.goalAmount}
            currentAmount={processedCampaign.currentAmount}
            status={processedCampaign.status}
          />
          {processedCampaign.minOrderValue && (
            <p className="text-sm text-muted-foreground mt-2">
              Valor mínimo do pedido: R$ {processedCampaign.minOrderValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </CardContent>
      </Card>

      {cart.length > 0 && (
        <OrderTotalizer
          subtotal={subtotal}
          cashbackPercent={cashbackPercent}
          itemCount={itemCount}
          minOrderValue={processedCampaign.minOrderValue || 0}
          onCheckout={() => setShowConfirmModal(true)}
        />
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Produtos da Campanha
        </h2>
        {processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processedProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onQuantityChange={(qty) => handleQuantityChange(product.id, qty, product.price, product.name)}
                initialQuantity={cart.find((item) => item.productId === product.id)?.quantity || 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum produto disponível nesta campanha
          </p>
        )}
      </div>

      <OrderConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        total={subtotal}
        cashbackAmount={(subtotal * cashbackPercent) / 100}
        supplierName={processedCampaign.supplierName}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
}

export default CampaignProductsPage;
