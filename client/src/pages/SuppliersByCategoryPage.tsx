import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SupplierCard } from "@/components/SupplierCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { suppliersApi, campaignsApi, filesApi } from "@/lib/api";

export function SuppliersByCategoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Buscar fornecedores
  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => suppliersApi.list(),
  });

  // Buscar campanhas (para contar campanhas ativas)
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => campaignsApi.list(),
  });

  // Buscar arquivos (para verificar se fornecedor tem arquivos)
  const { data: allFiles = [] } = useQuery({
    queryKey: ["files"],
    queryFn: () => filesApi.list(),
  });

  // Processar fornecedores
  const processedSuppliers = useMemo(() => {
    return suppliers.map((supplier: any) => {
      const supplierCampaigns = campaigns.filter((c: any) => c.supplier?.id === supplier.id);
      const supplierFiles = allFiles.filter((f: any) => f.supplier?.id === supplier.id);
      
      return {
        id: supplier.id.toString(),
        name: supplier.trade_name || supplier.legal_name || "Fornecedor",
        category: supplier.category || "Sem categoria",
        contactPhone: supplier.contact_phone,
        whatsappNumber: supplier.whatsapp_link?.replace("https://wa.me/", "") || supplier.contact_phone,
        activeCampaigns: supplierCampaigns.length,
        hasFiles: supplierFiles.length > 0,
      };
    });
  }, [suppliers, campaigns, allFiles]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(processedSuppliers.map((s: any) => s.category).filter(Boolean));
    return ["Todos", ...Array.from(cats)];
  }, [processedSuppliers]);

  // Filtrar fornecedores
  const filteredSuppliers = useMemo(() => {
    return processedSuppliers.filter((supplier: any) => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || supplier.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [processedSuppliers, searchQuery, selectedCategory]);

  // Agrupar por categoria
  const suppliersByCategory = useMemo(() => {
    return categories
      .filter(cat => cat !== "Todos")
      .map(category => ({
        category,
        suppliers: processedSuppliers.filter((s: any) => s.category === category),
      }))
      .filter(group => group.suppliers.length > 0);
  }, [categories, processedSuppliers]);

  if (loadingSuppliers) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Fornecedores por Categoria</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Fornecedores por Categoria</h1>
        <p className="text-muted-foreground">Explore fornecedores organizados por categoria de produtos</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-supplier"
          />
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
          <TabsList className="flex-wrap h-auto">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="text-sm"
                data-testid={`tab-category-${cat.toLowerCase()}`}
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {selectedCategory === "Todos" ? (
        <div className="space-y-8">
          {suppliersByCategory.length > 0 ? (
            suppliersByCategory.map(({ category, suppliers }) => {
              const filtered = suppliers.filter((supplier: any) =>
                supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              if (filtered.length === 0) return null;
              
              return (
                <Card key={category} data-testid={`card-category-${category.toLowerCase()}`}>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtered.map((supplier: any) => (
                        <Link key={supplier.id} href={`/supplier/${supplier.id}`}>
                          <SupplierCard
                            {...supplier}
                            onClick={() => {}}
                          />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum fornecedor cadastrado
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier: any) => (
              <Link key={supplier.id} href={`/supplier/${supplier.id}`}>
                <SupplierCard
                  {...supplier}
                  onClick={() => {}}
                />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Nenhum fornecedor encontrado nesta categoria
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SuppliersByCategoryPage;
