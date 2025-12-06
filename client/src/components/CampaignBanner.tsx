import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import { Calendar, Target, ArrowRight } from "lucide-react";

interface CampaignBannerProps {
  id: string;
  title: string;
  supplierName: string;
  description: string;
  imageUrl?: string;
  endDate: string;
  hasGoal: boolean;
  goalAmount?: number;
  currentAmount?: number;
  minOrderValue?: number;
  status: "active" | "ended" | "upcoming";
  onClick?: () => void;
}

export function CampaignBanner({
  id,
  title,
  supplierName,
  description,
  imageUrl,
  endDate,
  hasGoal,
  goalAmount,
  currentAmount,
  minOrderValue,
  status,
  onClick,
}: CampaignBannerProps) {
  const progress = hasGoal && goalAmount ? ((currentAmount || 0) / goalAmount) * 100 : 0;
  
  return (
    <Card 
      className="overflow-visible hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-campaign-${id}`}
    >
      <div className="relative">
        {imageUrl ? (
          <div 
            className="h-40 bg-cover bg-center rounded-t-md"
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-md" />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-md flex items-center justify-center">
            <Target className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} size="sm" />
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{supplierName}</p>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>Ate {endDate}</span>
        </div>
        
        {hasGoal && goalAmount && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso da meta</span>
              <span className="font-medium">
                R$ {(currentAmount || 0).toLocaleString("pt-BR")} / R$ {goalAmount.toLocaleString("pt-BR")}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {minOrderValue && (
          <p className="text-xs text-muted-foreground mb-3">
            Pedido minimo: R$ {minOrderValue.toLocaleString("pt-BR")}
          </p>
        )}
        
        <Link href={`/campaign/${id}/products`}>
          <Button className="w-full gap-2" data-testid={`button-campaign-view-${id}`}>
            Ver Produtos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
