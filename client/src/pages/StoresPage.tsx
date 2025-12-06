import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, MapPin, User, Phone, Copy, Check } from "lucide-react";
import { storesApi, ordersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const brazilianStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export function StoresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newStore, setNewStore] = useState({
    name: "",
    responsible: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    cnpj: "",
  });

  // Buscar lojas
  const { data: stores = [], isLoading: loadingStores } = useQuery({
    queryKey: ["stores"],
    queryFn: () => storesApi.list(),
  });

  // Buscar pedidos (para contar pedidos por loja)
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.list(),
  });

  // Processar lojas com contagem de pedidos
  const processedStores = useMemo(() => {
    return stores.map((store: any) => {
      const storeOrders = orders.filter((o: any) => o.store?.id === store.id);
      return {
        ...store,
        ordersCount: storeOrders.length,
      };
    });
  }, [stores, orders]);

  // Filtrar lojas
  const filteredStores = useMemo(() => {
    return processedStores.filter((store: any) =>
      store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.responsible?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [processedStores, searchQuery]);

  // Mutation para criar loja
  const createStoreMutation = useMutation({
    mutationFn: (data: any) => storesApi.create(data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Loja criada",
        description: response.credentials 
          ? `Credenciais geradas: ${response.credentials.username} / ${response.credentials.password}`
          : "Loja criada com sucesso!",
      });
      setShowAddModal(false);
      setNewStore({ name: "", responsible: "", phone: "", email: "", address: "", city: "", state: "", cnpj: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar loja",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar loja
  const updateStoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => storesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Loja atualizada",
        description: "Loja atualizada com sucesso!",
      });
      setEditingStore(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar loja",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar loja
  const deleteStoreMutation = useMutation({
    mutationFn: (id: number) => storesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Loja removida",
        description: "Loja removida com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover loja",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleAddStore = () => {
    // Se não forneceu email, será gerado automaticamente
    createStoreMutation.mutate(newStore);
  };

  const handleEditStore = (store: any) => {
    setEditingStore(store);
    setNewStore({
      name: store.name || "",
      responsible: store.responsible || "",
      phone: store.phone || "",
      email: store.user?.email || "",
      address: store.address || "",
      city: store.city || "",
      state: store.state || "",
      cnpj: store.cnpj || "",
    });
    setShowAddModal(true);
  };

  const handleUpdateStore = () => {
    if (!editingStore) return;
    updateStoreMutation.mutate({
      id: editingStore.id,
      data: newStore,
    });
  };

  const handleDeleteStore = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta loja?")) {
      deleteStoreMutation.mutate(id);
    }
  };

  const handleCopyCredentials = (store: any) => {
    if (store.user?.email) {
      const credentials = `Email: ${store.user.email}\nSenha: [Gerada automaticamente]`;
      navigator.clipboard.writeText(credentials);
      setCopiedId(store.id.toString());
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loadingStores) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Lojas</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Lojas</h1>
          <p className="text-muted-foreground">Gerencie as lojas cadastradas na plataforma</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingStore(null);
          setNewStore({ name: "", responsible: "", phone: "", email: "", address: "", city: "", state: "", cnpj: "" });
          setShowAddModal(true);
        }} data-testid="button-add-store">
          <Plus className="h-4 w-4" />
          Nova Loja
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar lojas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-store"
        />
      </div>

      {filteredStores.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store: any) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {store.responsible || "Não informado"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {store.city && store.state ? `${store.city}/${store.state}` : "Não informado"}
                      </div>
                    </TableCell>
                    <TableCell>{store.ordersCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {store.user?.email && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopyCredentials(store)}
                            data-testid={`button-copy-credentials-${store.id}`}
                          >
                            {copiedId === store.id.toString() ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditStore(store)}
                          data-testid={`button-edit-store-${store.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteStore(store.id)}
                          data-testid={`button-delete-store-${store.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhuma loja encontrada" : "Nenhuma loja cadastrada"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) {
          setEditingStore(null);
          setNewStore({ name: "", responsible: "", phone: "", email: "", address: "", city: "", state: "", cnpj: "" });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStore ? "Editar Loja" : "Nova Loja"}</DialogTitle>
            <DialogDescription>
              {editingStore ? "Atualize as informações da loja" : "Cadastre uma nova loja no sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName">Nome da Loja *</Label>
              <Input
                id="storeName"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                placeholder="Ex: Mercado Central"
                data-testid="input-store-name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="responsible">Responsável *</Label>
                <Input
                  id="responsible"
                  value={newStore.responsible}
                  onChange={(e) => setNewStore({ ...newStore, responsible: e.target.value })}
                  placeholder="Nome do responsável"
                  data-testid="input-store-responsible"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newStore.phone}
                  onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  data-testid="input-store-phone"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email (opcional - será gerado automaticamente se não fornecido)</Label>
              <Input
                id="email"
                type="email"
                value={newStore.email}
                onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                placeholder="loja@exemplo.com"
                data-testid="input-store-email"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={newStore.cnpj}
                onChange={(e) => setNewStore({ ...newStore, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                data-testid="input-store-cnpj"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                placeholder="Rua, número, complemento"
                data-testid="input-store-address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={newStore.city}
                  onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                  placeholder="Cidade"
                  data-testid="input-store-city"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="state">Estado (UF) *</Label>
                <Select
                  value={newStore.state}
                  onValueChange={(value) => setNewStore({ ...newStore, state: value })}
                >
                  <SelectTrigger id="state" data-testid="select-store-state">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingStore ? handleUpdateStore : handleAddStore}
              disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
              data-testid="button-save-store"
            >
              {editingStore ? "Atualizar" : "Criar"} Loja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StoresPage;
