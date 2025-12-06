import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, MessageCircle, FileText, ArrowRight } from "lucide-react";

interface SupplierCardProps {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  activeCampaigns: number;
  hasFiles: boolean;
  onClick?: () => void;
}

export function SupplierCard({
  id,
  name,
  category,
  logoUrl,
  contactPhone,
  whatsappNumber,
  activeCampaigns,
  hasFiles,
  onClick,
}: SupplierCardProps) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`, "_blank");
    }
  };

  return (
    <Card 
      className="overflow-visible hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-supplier-${id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-12 w-12 object-contain" />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">{category}</p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {activeCampaigns > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeCampaigns} campanha{activeCampaigns > 1 ? "s" : ""} ativa{activeCampaigns > 1 ? "s" : ""}
                </Badge>
              )}
              {hasFiles && (
                <Badge variant="outline" className="text-xs gap-1">
                  <FileText className="h-3 w-3" />
                  Arquivos
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          {contactPhone && (
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1"
              onClick={(e) => { e.stopPropagation(); }}
              data-testid={`button-supplier-phone-${id}`}
            >
              <Phone className="h-3 w-3" />
              Ligar
            </Button>
          )}
          {whatsappNumber && (
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1"
              onClick={handleWhatsApp}
              data-testid={`button-supplier-whatsapp-${id}`}
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </Button>
          )}
          <Button 
            size="sm" 
            className="ml-auto gap-1"
            data-testid={`button-supplier-view-${id}`}
          >
            Ver
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
