import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    stock: "",
    image_url: "",
  });

  // Buscar produtos
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list(),
  });

  // Buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const category = categories.find((c: any) => c.id === product.category_id);
      const categoryName = category?.name || "";
      return (
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [products, categories, searchQuery]);

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Produto criado",
        description: "Produto adicionado com sucesso!",
      });
      setShowAddModal(false);
      setNewProduct({ name: "", description: "", category_id: "", price: "", stock: "", image_url: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!",
      });
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Produto removido",
        description: "Produto removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover produto",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleAddProduct = () => {
    // Obter supplier_id do contexto (assumindo que existe)
    const supplierId = 1; // TODO: Obter do contexto de autenticação

    createProductMutation.mutate({
      supplier_id: supplierId,
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id?.toString() || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "",
      image_url: product.image_url || "",
    });
    setShowAddModal(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    updateProductMutation.mutate({
      id: editingProduct.id,
      data: {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
      },
    });
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Tem certeza que deseja remover este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  if (loadingProducts) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Meus Produtos</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Meus Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingProduct(null);
          setNewProduct({ name: "", description: "", category_id: "", price: "", stock: "", image_url: "" });
          setShowAddModal(true);
        }} data-testid="button-add-product">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-product"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => {
                  const category = categories.find((c: any) => c.id === product.category_id);
                  const isOutOfStock = Number(product.stock || 0) === 0;
                  const isLowStock = Number(product.stock || 0) > 0 && Number(product.stock || 0) < 10;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{category?.name || "Sem categoria"}</TableCell>
                      <TableCell>
                        R$ {Number(product.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.stock || 0}
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isOutOfStock ? "destructive" : "default"}>
                          {isOutOfStock ? "Sem estoque" : "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditProduct(product)}
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product.id)}
                            data-testid={`button-delete-product-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) {
          setEditingProduct(null);
          setNewProduct({ name: "", description: "", category_id: "", price: "", stock: "", image_url: "" });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Atualize as informações do produto" : "Adicione um novo produto ao catálogo"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Ex: Refrigerante Cola 2L"
                data-testid="input-product-name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Descrição do produto"
                rows={3}
                data-testid="input-product-description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newProduct.category_id}
                  onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
                >
                  <SelectTrigger id="category" data-testid="select-product-category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-product-price"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="0"
                  data-testid="input-product-stock"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-product-image"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
              data-testid="button-save-product"
            >
              {editingProduct ? "Atualizar" : "Criar"} Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductsPage;
