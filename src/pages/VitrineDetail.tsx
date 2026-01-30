import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Maximize, 
  TrendingUp, 
  Star, 
  Sparkles, 
  MessageCircle,
  ExternalLink,
  Ruler,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VitrineDisclaimer } from '@/components/vitrine/VitrineDisclaimer';
import { useVitrinePropertyDetail } from '@/hooks/useVitrineProperties';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

export default function VitrineDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, error } = useVitrinePropertyDetail(id || '');

  const whatsappNumber = '5519971223648';
  const whatsappMessage = property 
    ? `Olá! Tenho interesse no imóvel "${property.title}" disponível na vitrine do Setter Toolbox.`
    : 'Olá! Tenho interesse em um imóvel da vitrine.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 container mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="aspect-[21/9] bg-muted rounded-xl" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="h-10 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-24 bg-muted rounded" />
              </div>
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 container mx-auto px-4 text-center py-16">
          <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Imóvel não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Este imóvel pode não estar mais disponível.
          </p>
          <Link to="/vitrine">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a Vitrine
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const typeLabel = property.property_type ? propertyTypeLabels[property.property_type] || property.property_type : null;
  const transactionLabel = property.transaction_type ? transactionTypeLabels[property.transaction_type] || property.transaction_type : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-primary to-primary/95">
        <div className="container mx-auto px-4">
          <Link to="/vitrine">
            <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Vitrine
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-8">
        {/* Image */}
        <div className="relative aspect-[21/9] md:aspect-[21/7] overflow-hidden rounded-xl bg-muted mb-8">
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.is_featured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                Destaque
              </Badge>
            )}
            {property.is_opportunity && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Oportunidade
              </Badge>
            )}
          </div>

          {transactionLabel && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-base px-3 py-1">
                {transactionLabel}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <div>
              {typeLabel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Building2 className="h-4 w-4" />
                  <span>{typeLabel}</span>
                </div>
              )}
              <h1 className="text-3xl font-bold mb-3">{property.title}</h1>
              {(property.neighborhood || property.city || property.state) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {[property.neighborhood, property.city, property.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            {property.price && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Valor</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(property.price)}</p>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Características</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.area_sqm && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Maximize className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Área Total</p>
                        <p className="font-semibold">{formatNumber(property.area_sqm)} m²</p>
                      </div>
                    </div>
                  )}
                  {property.built_area_sqm && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Área Construída</p>
                        <p className="font-semibold">{formatNumber(property.built_area_sqm)} m²</p>
                      </div>
                    </div>
                  )}
                  {property.land_area_sqm && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Área do Terreno</p>
                        <p className="font-semibold">{formatNumber(property.land_area_sqm)} m²</p>
                      </div>
                    </div>
                  )}
                  {property.front_meters && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Testada</p>
                        <p className="font-semibold">{formatNumber(property.front_meters)} m</p>
                      </div>
                    </div>
                  )}
                  {property.cap_rate && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cap Rate</p>
                        <p className="font-semibold">{formatNumber(property.cap_rate, 1)}%</p>
                      </div>
                    </div>
                  )}
                  {property.vocation && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Vocação</p>
                        <p className="font-semibold">{property.vocation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map Link */}
            {property.google_maps_link && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Localização</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={property.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver no Google Maps
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Interessado neste imóvel?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Fale com nossa equipe de corretores para mais informações sobre 
                    disponibilidade, condições de pagamento e agendamento de visita.
                  </p>
                  <Separator />
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Falar com Corretor
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <VitrineDisclaimer />
            </div>
          </div>
        </div>
      </main>

      <VitrineDisclaimer variant="footer" />
      <Footer />
    </div>
  );
}
