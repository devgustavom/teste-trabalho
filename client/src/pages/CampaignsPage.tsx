import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CampaignBanner } from "@/components/CampaignBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Target } from "lucide-react";
import { campaignsApi, suppliersApi, productsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface NewCampaign {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  hasGoal: boolean;
  goalAmount: string;
  min_order_value: string;
  banner_url: string;
  product_ids: number[];
}

export function CampaignsPage({ isSupplier = false }: { isSupplier?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newCampaign, setNewCampaign] = useState<NewCampaign>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    hasGoal: false,
    goalAmount: "",
    min_order_value: "",
    banner_url: "",
    product_ids: [],
  });

  // Buscar campanhas
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => campaignsApi.list(),
  });

  // Buscar fornecedores (para admin)
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => suppliersApi.list(),
    enabled: !isSupplier,
  });

  // Buscar produtos (para seleção na campanha)
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list(),
  });

  // Processar campanhas
  const processedCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns.map((campaign: any) => {
      const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
      const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
      
      let status: "active" | "ended" | "upcoming" = "active";
      if (endDate && endDate < now) {
        status = "ended";
      } else if (startDate && startDate > now) {
        status = "upcoming";
      }

      return {
        id: campaign.id.toString(),
        title: campaign.title,
        supplierName: campaign.supplier?.legal_name || campaign.supplier?.trade_name || "Fornecedor",
        description: campaign.description || "",
        endDate: endDate ? endDate.toLocaleDateString("pt-BR") : "",
        hasGoal: campaign.target_type === "general",
        goalAmount: campaign.target_amount ? Number(campaign.target_amount) : undefined,
        currentAmount: 0, // Seria calculado
        minOrderValue: campaign.min_order_value ? Number(campaign.min_order_value) : undefined,
        status,
        imageUrl: campaign.banner_url,
        campaignData: campaign,
      };
    });
  }, [campaigns]);

  // Filtrar campanhas
  const filteredCampaigns = useMemo(() => {
    return processedCampaigns.filter((campaign) => {
      const matchesSearch = 
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [processedCampaigns, searchQuery, statusFilter]);

  // Mutation para criar campanha
  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => campaignsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campanha criada",
        description: "Campanha criada com sucesso!",
      });
      setShowAddModal(false);
      setNewCampaign({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        hasGoal: false,
        goalAmount: "",
        min_order_value: "",
        banner_url: "",
        product_ids: [],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar campanha
  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => campaignsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campanha atualizada",
        description: "Campanha atualizada com sucesso!",
      });
      setEditingCampaign(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar campanha",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar campanha
  const deleteCampaignMutation = useMutation({
    mutationFn: (id: number) => campaignsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campanha removida",
        description: "Campanha removida com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover campanha",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleAddCampaign = () => {
    // Obter supplier_id do contexto (assumindo que existe)
    const supplierId = 1; // TODO: Obter do contexto de autenticação

    createCampaignMutation.mutate({
      supplier_id: supplierId,
      title: newCampaign.title,
      description: newCampaign.description,
      start_date: newCampaign.start_date || null,
      end_date: newCampaign.end_date || null,
      target_type: newCampaign.hasGoal ? "general" : "individual",
      target_amount: newCampaign.hasGoal && newCampaign.goalAmount ? parseFloat(newCampaign.goalAmount) : null,
      min_order_value: newCampaign.min_order_value ? parseFloat(newCampaign.min_order_value) : 0,
      banner_url: newCampaign.banner_url || null,
      product_ids: newCampaign.product_ids,
    });
  };

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    const campaignData = campaign.campaignData || campaign;
    setNewCampaign({
      title: campaignData.title || "",
      description: campaignData.description || "",
      start_date: campaignData.start_date ? new Date(campaignData.start_date).toISOString().split("T")[0] : "",
      end_date: campaignData.end_date ? new Date(campaignData.end_date).toISOString().split("T")[0] : "",
      hasGoal: campaignData.target_type === "general",
      goalAmount: campaignData.target_amount?.toString() || "",
      min_order_value: campaignData.min_order_value?.toString() || "",
      banner_url: campaignData.banner_url || "",
      product_ids: [],
    });
    setShowAddModal(true);
  };

  const handleUpdateCampaign = () => {
    if (!editingCampaign) return;
    const campaignData = editingCampaign.campaignData || editingCampaign;
    
    updateCampaignMutation.mutate({
      id: campaignData.id,
      data: {
        title: newCampaign.title,
        description: newCampaign.description,
        start_date: newCampaign.start_date || null,
        end_date: newCampaign.end_date || null,
        target_type: newCampaign.hasGoal ? "general" : "individual",
        target_amount: newCampaign.hasGoal && newCampaign.goalAmount ? parseFloat(newCampaign.goalAmount) : null,
        min_order_value: newCampaign.min_order_value ? parseFloat(newCampaign.min_order_value) : 0,
        banner_url: newCampaign.banner_url || null,
      },
    });
  };

  const handleDeleteCampaign = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta campanha?")) {
      deleteCampaignMutation.mutate(id);
    }
  };

  if (loadingCampaigns) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Campanhas</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas promocionais</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingCampaign(null);
          setNewCampaign({
            title: "",
            description: "",
            start_date: "",
            end_date: "",
            hasGoal: false,
            goalAmount: "",
            min_order_value: "",
            banner_url: "",
            product_ids: [],
          });
          setShowAddModal(true);
        }} data-testid="button-add-campaign">
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-campaign"
          />
        </div>
      </div>

      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="relative">
              <CampaignBanner {...campaign} />
              {isSupplier && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-background/80"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-background/80"
                    onClick={() => {
                      const campaignData = campaign.campaignData || campaign;
                      handleDeleteCampaign(parseInt(campaign.id));
                    }}
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhuma campanha encontrada" : "Nenhuma campanha cadastrada"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) {
          setEditingCampaign(null);
          setNewCampaign({
            title: "",
            description: "",
            start_date: "",
            end_date: "",
            hasGoal: false,
            goalAmount: "",
            min_order_value: "",
            banner_url: "",
            product_ids: [],
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
            <DialogDescription>
              {editingCampaign ? "Atualize as informações da campanha" : "Crie uma nova campanha promocional"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Campanha *</Label>
              <Input
                id="title"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                placeholder="Ex: Promoção de Verão"
                data-testid="input-campaign-title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                placeholder="Descrição da campanha"
                rows={3}
                data-testid="input-campaign-description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newCampaign.start_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                  data-testid="input-campaign-start-date"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="end_date">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newCampaign.end_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                  data-testid="input-campaign-end-date"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="min_order_value">Pedido Mínimo (R$)</Label>
              <Input
                id="min_order_value"
                type="number"
                step="0.01"
                value={newCampaign.min_order_value}
                onChange={(e) => setNewCampaign({ ...newCampaign, min_order_value: e.target.value })}
                placeholder="Opcional"
                data-testid="input-min-order"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <p className="font-medium">Campanha com Meta</p>
                <p className="text-sm text-muted-foreground">
                  Pedidos só são validados se a meta for atingida
                </p>
              </div>
              <Switch
                checked={newCampaign.hasGoal}
                onCheckedChange={(checked) => setNewCampaign({ ...newCampaign, hasGoal: checked })}
                data-testid="switch-has-goal"
              />
            </div>
            
            {newCampaign.hasGoal && (
              <div className="grid gap-2">
                <Label htmlFor="goalAmount">Meta (R$)</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  step="0.01"
                  value={newCampaign.goalAmount}
                  onChange={(e) => setNewCampaign({ ...newCampaign, goalAmount: e.target.value })}
                  placeholder="Valor total da meta"
                  data-testid="input-goal-amount"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="banner_url">URL do Banner</Label>
              <Input
                id="banner_url"
                value={newCampaign.banner_url}
                onChange={(e) => setNewCampaign({ ...newCampaign, banner_url: e.target.value })}
                placeholder="https://..."
                data-testid="input-campaign-banner"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingCampaign ? handleUpdateCampaign : handleAddCampaign}
              disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
              data-testid="button-save-campaign"
            >
              {editingCampaign ? "Atualizar" : "Criar"} Campanha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CampaignsPage;
