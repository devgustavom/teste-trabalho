import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignBanner } from "@/components/CampaignBanner";
import { ProductCard } from "@/components/ProductCard";
import { OrderTotalizer } from "@/components/OrderTotalizer";
import { OrderConfirmModal } from "@/components/OrderConfirmModal";
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MessageCircle,
  MapPin,
  ShoppingCart
} from "lucide-react";
import { suppliersApi, productsApi, campaignsApi, ordersApi, stateConditionsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export function SupplierDetail() {
  const [, params] = useRoute("/supplier/:id");
  const supplierId = params?.id ? parseInt(params.id) : null;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Buscar fornecedor
  const { data: supplier, isLoading: loadingSupplier } = useQuery({
    queryKey: ["suppliers", supplierId],
    queryFn: () => suppliersApi.get(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos (antes era cacheTime)
  });

  // Buscar produtos do fornecedor
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "supplier", supplierId],
    queryFn: () => productsApi.list(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Buscar campanhas do fornecedor
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", "supplier", supplierId],
    queryFn: () => campaignsApi.list(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Buscar condições regionais (para calcular cashback)
  const { data: stateConditions = [] } = useQuery({
    queryKey: ["state-conditions", "supplier", supplierId],
    queryFn: () => stateConditionsApi.list(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Processar produtos
  const processedProducts = useMemo(() => {
    return products.map((product: any) => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      unit: "unidade",
      imageUrl: product.image_url,
    }));
  }, [products]);

  // Processar campanhas
  const processedCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns
      .filter((campaign: any) => {
        if (campaign.end_date) {
          return new Date(campaign.end_date) >= now;
        }
        return true;
      })
      .map((campaign: any) => ({
        id: campaign.id.toString(),
        title: campaign.title,
        supplierName: supplier?.legal_name || supplier?.trade_name || "Fornecedor",
        description: campaign.description || "",
        endDate: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString("pt-BR") : "",
        hasGoal: campaign.target_type === "general",
        goalAmount: campaign.target_amount ? Number(campaign.target_amount) : undefined,
        currentAmount: 0, // Seria calculado
        minOrderValue: campaign.min_order_value ? Number(campaign.min_order_value) : undefined,
        status: "active" as const,
        imageUrl: campaign.banner_url,
      }));
  }, [campaigns, supplier]);

  // Calcular cashback (assumindo estado da loja - seria obtido do contexto)
  const cashbackPercent = useMemo(() => {
    // Por padrão, usar primeira condição ou 0
    if (stateConditions.length > 0) {
      return Number(stateConditions[0].cashback_percent || 0);
    }
    return 0;
  }, [stateConditions]);

  const handleQuantityChange = (productId: string, quantity: number, price: number, name: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (quantity === 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      }
      return [...prev, { productId, quantity, price, name }];
    });
  };
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleWhatsApp = () => {
    if (supplier?.whatsapp_link) {
      window.open(supplier.whatsapp_link, "_blank");
    } else if (supplier?.contact_phone) {
      const phone = supplier.contact_phone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}`, "_blank");
    }
  };

  const handleConfirmOrder = (data: { paymentType: string; isBudget: boolean; notes?: string }) => {
    console.log("🔍 handleConfirmOrder iniciado");
    console.log("📍 supplierId:", supplierId);
    console.log("📍 supplier data:", supplier);
    
    if (!supplierId) {
      console.error("❌ supplierId é null ou undefined");
      toast({
        title: "Erro",
        description: "Fornecedor não identificado.",
        variant: "destructive",
      });
      return;
    }

    // Obter store_id do localStorage
    const userStr = localStorage.getItem("user");
    let storeId: number | null = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("📋 Usuário do localStorage:", user);
        storeId = user.store_id || (user.store && user.store.id) || null;
        console.log("🏪 storeId obtido:", storeId);
      } catch (error) {
        console.error("❌ Erro ao parsear usuário:", error);
      }
    }

    if (!storeId) {
      console.error("❌ storeId não encontrado no localStorage");
      toast({
        title: "Erro",
        description: "Loja não identificada. Por favor, faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      store_id: storeId,
      supplier_id: supplierId,
      payment_type: data.paymentType,
      is_budget: data.isBudget,
      notes: data.notes,
      items: cart.map(item => ({
        product_id: parseInt(item.productId),
        quantity: item.quantity,
      })),
    };

    console.log("📤 Enviando pedido:", orderData);
    createOrderMutation.mutate(orderData);
  };

  if (loadingSupplier) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando fornecedor...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Fornecedor não encontrado</p>
        <Link href="/">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  const supplierName = supplier.trade_name || supplier.legal_name || "Fornecedor";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/suppliers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{supplierName}</h1>
          <p className="text-muted-foreground">{supplier.category || "Sem categoria"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="text-sm font-medium">{supplier.commercial_policy ? "Ver política comercial" : "Sem descrição"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {supplier.contact_phone && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{supplier.contact_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {supplier.email && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{supplier.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {supplier.address && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="text-sm font-medium line-clamp-1">{supplier.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {(supplier.whatsapp_link || supplier.contact_phone) && (
        <Card>
          <CardContent className="p-4">
            <Button onClick={handleWhatsApp} className="gap-2" variant="outline">
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}

      {supplier.commercial_policy && (
        <Card>
          <CardHeader>
            <CardTitle>Política Comercial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{supplier.commercial_policy}</p>
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Fazer Pedido</h3>
              <p className="text-sm text-muted-foreground">
                Selecione produtos abaixo, escolha as quantidades e finalize seu pedido
              </p>
            </div>
            {cart.length > 0 && (
              <Badge variant="default" className="text-lg px-4 py-2">
                {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" className="gap-2" data-testid="tab-products">
            <ShoppingCart className="h-4 w-4" />
            Produtos e Pedido
          </TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">
            Campanhas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          {cart.length > 0 && (
            <OrderTotalizer
              subtotal={subtotal}
              cashbackPercent={cashbackPercent}
              itemCount={itemCount}
              minOrderValue={0}
              onCheckout={() => setShowConfirmModal(true)}
            />
          )}
          
          {loadingProducts ? (
            <p className="text-center text-muted-foreground py-8">Carregando produtos...</p>
          ) : processedProducts.length > 0 ? (
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
              Nenhum produto disponível
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="campaigns">
          {processedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedCampaigns.map((campaign) => (
                <CampaignBanner key={campaign.id} {...campaign} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma campanha ativa
            </p>
          )}
        </TabsContent>
      </Tabs>
      
      <OrderConfirmModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        total={subtotal}
        cashbackAmount={(subtotal * cashbackPercent) / 100}
        supplierName={supplierName}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
}

export default SupplierDetail;
