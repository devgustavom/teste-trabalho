import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Minus, ZoomIn, Package } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  stock: number;
  unit: string;
  onQuantityChange?: (quantity: number) => void;
  initialQuantity?: number;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  originalPrice,
  imageUrl,
  stock,
  unit,
  onQuantityChange,
  initialQuantity = 0,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [showZoom, setShowZoom] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(0, Math.min(newQty, stock));
    setQuantity(validQty);
    onQuantityChange?.(validQty);
  };
  
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isOutOfStock = stock === 0;
  
  return (
    <>
      <Card 
        className={`overflow-visible ${isOutOfStock ? "opacity-60" : ""}`}
        data-testid={`card-product-${id}`}
      >
        <div 
          className="relative aspect-square bg-muted rounded-t-md cursor-pointer overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => !isOutOfStock && setShowZoom(true)}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? "scale-110" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {isHovered && !isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white" />
            </div>
          )}
          
          {discount > 0 && (
            <Badge className="absolute top-2 left-2" variant="destructive">
              -{discount}%
            </Badge>
          )}
          
          {isOutOfStock && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Sem estoque
            </Badge>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-1" title={name}>{name}</h3>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{description}</p>
          )}
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold">
              R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            {stock > 0 ? `${stock} ${unit} em estoque` : "Indisponivel"}
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity === 0 || isOutOfStock}
              data-testid={`button-product-minus-${id}`}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
              className="text-center"
              min={0}
              max={stock}
              disabled={isOutOfStock}
              data-testid={`input-product-quantity-${id}`}
            />
            
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= stock || isOutOfStock}
              data-testid={`button-product-plus-${id}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {quantity > 0 && (
            <p className="text-sm font-medium text-primary mt-2 text-center">
              Subtotal: R$ {(quantity * price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showZoom} onOpenChange={setShowZoom}>
        <DialogContent className="max-w-2xl">
          <div className="aspect-square bg-muted rounded-md">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg">{name}</h3>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
            <p className="text-xl font-bold mt-2">
              R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
