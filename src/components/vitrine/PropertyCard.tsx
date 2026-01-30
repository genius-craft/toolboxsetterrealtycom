import { Link } from 'react-router-dom';
import { Building2, MapPin, Maximize, TrendingUp, Star, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type { VitrineProperty } from '@/hooks/useVitrineProperties';

interface PropertyCardProps {
  property: VitrineProperty;
}

const propertyTypeLabels: Record<string, string> = {
  terreno: 'Terreno',
  comercial: 'Comercial',
  residencial: 'Residencial',
  industrial: 'Industrial',
  rural: 'Rural',
  misto: 'Misto',
};

const transactionTypeLabels: Record<string, string> = {
  venda: 'Venda',
  locacao: 'Locação',
  permuta: 'Permuta',
};

export function PropertyCard({ property }: PropertyCardProps) {
  const {
    id,
    title,
    city,
    state,
    price,
    area_sqm,
    built_area_sqm,
    property_type,
    transaction_type,
    cap_rate,
    image_url,
    is_featured,
    is_opportunity,
  } = property;

  const displayArea = built_area_sqm || area_sqm;
  const typeLabel = property_type ? propertyTypeLabels[property_type] || property_type : null;
  const transactionLabel = transaction_type ? transactionTypeLabels[transaction_type] || transaction_type : null;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {is_featured && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
              <Star className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
          {is_opportunity && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Oportunidade
            </Badge>
          )}
        </div>

        {/* Transaction Badge */}
        {transactionLabel && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {transactionLabel}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        {/* Type */}
        {typeLabel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            <span>{typeLabel}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Location */}
        {(city || state) && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{[city, state].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        {/* Price */}
        {price && (
          <p className="text-xl font-bold text-primary mb-3">
            {formatCurrency(price)}
          </p>
        )}

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {displayArea && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{formatNumber(displayArea)} m²</span>
            </div>
          )}
          {cap_rate && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Cap Rate: {formatNumber(cap_rate, 1)}%</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/vitrine/${id}`}>
            Ver Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
