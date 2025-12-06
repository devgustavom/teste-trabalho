import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Plus, Edit, Trash2, Building2, MapPin, Phone, Mail } from "lucide-react";
import { suppliersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const brazilianStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newSupplier, setNewSupplier] = useState({
    legal_name: "",
    trade_name: "",
    cnpj: "",
    state: "",
    city: "",
    address: "",
    contact_name: "",
    contact_phone: "",
    email: "",
    commercial_policy: "",
    whatsapp_link: "",
    category: "",
  });

  // Buscar fornecedores
  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => suppliersApi.list(),
  });

  // Filtrar fornecedores
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier: any) =>
      (supplier.trade_name || supplier.legal_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.city || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  // Mutation para criar fornecedor
  const createSupplierMutation = useMutation({
    mutationFn: (data: any) => suppliersApi.create(data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Fornecedor criado",
        description: response.credentials 
          ? `Credenciais geradas: ${response.credentials.username} / ${response.credentials.password}`
          : "Fornecedor criado com sucesso!",
      });
      setShowAddModal(false);
      setNewSupplier({
        legal_name: "",
        trade_name: "",
        cnpj: "",
        state: "",
        city: "",
        address: "",
        contact_name: "",
        contact_phone: "",
        email: "",
        commercial_policy: "",
        whatsapp_link: "",
        category: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar fornecedor",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar fornecedor
  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => suppliersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Fornecedor atualizado",
        description: "Fornecedor atualizado com sucesso!",
      });
      setEditingSupplier(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar fornecedor",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar fornecedor
  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Fornecedor removido",
        description: "Fornecedor removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover fornecedor",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleAddSupplier = () => {
    createSupplierMutation.mutate(newSupplier);
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      legal_name: supplier.legal_name || "",
      trade_name: supplier.trade_name || "",
      cnpj: supplier.cnpj || "",
      state: supplier.state || "",
      city: supplier.city || "",
      address: supplier.address || "",
      contact_name: supplier.contact_name || "",
      contact_phone: supplier.contact_phone || "",
      email: supplier.email || "",
      commercial_policy: supplier.commercial_policy || "",
      whatsapp_link: supplier.whatsapp_link || "",
      category: supplier.category || "",
    });
    setShowAddModal(true);
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier) return;
    updateSupplierMutation.mutate({
      id: editingSupplier.id,
      data: newSupplier,
    });
  };

  const handleDeleteSupplier = (id: number) => {
    if (confirm("Tem certeza que deseja remover este fornecedor?")) {
      deleteSupplierMutation.mutate(id);
    }
  };

  if (loadingSuppliers) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Fornecedores</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie os fornecedores cadastrados na plataforma</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingSupplier(null);
          setNewSupplier({
            legal_name: "",
            trade_name: "",
            cnpj: "",
            state: "",
            city: "",
            address: "",
            contact_name: "",
            contact_phone: "",
            email: "",
            commercial_policy: "",
            whatsapp_link: "",
            category: "",
          });
          setShowAddModal(true);
        }} data-testid="button-add-supplier">
          <Plus className="h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fornecedores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-supplier"
        />
      </div>

      {filteredSuppliers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier: any) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.trade_name || supplier.legal_name || "Fornecedor"}
                    </TableCell>
                    <TableCell>{supplier.category || "Sem categoria"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {supplier.city && supplier.state ? `${supplier.city}/${supplier.state}` : "Não informado"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {supplier.contact_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {supplier.contact_phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditSupplier(supplier)}
                          data-testid={`button-edit-supplier-${supplier.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          data-testid={`button-delete-supplier-${supplier.id}`}
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
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) {
          setEditingSupplier(null);
          setNewSupplier({
            legal_name: "",
            trade_name: "",
            cnpj: "",
            state: "",
            city: "",
            address: "",
            contact_name: "",
            contact_phone: "",
            email: "",
            commercial_policy: "",
            whatsapp_link: "",
            category: "",
          });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? "Atualize as informações do fornecedor" : "Cadastre um novo fornecedor no sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="legal_name">Razão Social *</Label>
                <Input
                  id="legal_name"
                  value={newSupplier.legal_name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, legal_name: e.target.value })}
                  placeholder="Nome legal da empresa"
                  data-testid="input-supplier-legal-name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="trade_name">Nome Fantasia</Label>
                <Input
                  id="trade_name"
                  value={newSupplier.trade_name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, trade_name: e.target.value })}
                  placeholder="Nome comercial"
                  data-testid="input-supplier-trade-name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={newSupplier.cnpj}
                  onChange={(e) => setNewSupplier({ ...newSupplier, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  data-testid="input-supplier-cnpj"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={newSupplier.category}
                  onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                  placeholder="Ex: Bebidas, Alimentos, etc."
                  data-testid="input-supplier-category"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="state">Estado (UF) *</Label>
                <Select
                  value={newSupplier.state}
                  onValueChange={(value) => setNewSupplier({ ...newSupplier, state: value })}
                >
                  <SelectTrigger id="state" data-testid="select-supplier-state">
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
              
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={newSupplier.city}
                  onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
                  placeholder="Cidade"
                  data-testid="input-supplier-city"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="Rua, número, complemento"
                data-testid="input-supplier-address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_name">Nome do Contato</Label>
                <Input
                  id="contact_name"
                  value={newSupplier.contact_name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact_name: e.target.value })}
                  placeholder="Nome do representante"
                  data-testid="input-supplier-contact-name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact_phone">Telefone de Contato</Label>
                <Input
                  id="contact_phone"
                  value={newSupplier.contact_phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact_phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  data-testid="input-supplier-contact-phone"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email (opcional - será gerado automaticamente se não fornecido)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="contato@fornecedor.com"
                  data-testid="input-supplier-email"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="whatsapp_link">Link do WhatsApp</Label>
                <Input
                  id="whatsapp_link"
                  value={newSupplier.whatsapp_link}
                  onChange={(e) => setNewSupplier({ ...newSupplier, whatsapp_link: e.target.value })}
                  placeholder="https://wa.me/5511999999999"
                  data-testid="input-supplier-whatsapp"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="commercial_policy">Política Comercial</Label>
              <Textarea
                id="commercial_policy"
                value={newSupplier.commercial_policy}
                onChange={(e) => setNewSupplier({ ...newSupplier, commercial_policy: e.target.value })}
                placeholder="Descreva a política comercial, condições de pagamento, etc."
                rows={4}
                data-testid="input-supplier-policy"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
              disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
              data-testid="button-save-supplier"
            >
              {editingSupplier ? "Atualizar" : "Criar"} Fornecedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SuppliersPage;

