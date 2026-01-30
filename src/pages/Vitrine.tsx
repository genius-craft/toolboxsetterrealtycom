import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/vitrine/PropertyCard';
import { PropertyFilters } from '@/components/vitrine/PropertyFilters';
import { VitrineDisclaimer } from '@/components/vitrine/VitrineDisclaimer';
import { useVitrineProperties, useVitrineCities } from '@/hooks/useVitrineProperties';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Vitrine() {
  const [propertyType, setPropertyType] = useState('all');
  const [city, setCity] = useState('all');
  const [transactionType, setTransactionType] = useState('all');

  const { data: properties, isLoading, error } = useVitrineProperties({
    propertyType,
    city,
    transactionType,
  });

  const { data: cities = [] } = useVitrineCities();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary to-primary/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center">
              <Building2 className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Vitrine de Imóveis
              </h1>
              <p className="text-primary-foreground/60">
                Oportunidades selecionadas de investimento imobiliário
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Disclaimer */}
        <div className="mb-8">
          <VitrineDisclaimer />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <PropertyFilters
            propertyType={propertyType}
            city={city}
            transactionType={transactionType}
            cities={cities}
            onPropertyTypeChange={setPropertyType}
            onCityChange={setCity}
            onTransactionTypeChange={setTransactionType}
          />
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar imóveis</h2>
            <p className="text-muted-foreground">Tente novamente mais tarde.</p>
          </div>
        ) : properties?.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum imóvel encontrado</h2>
            <p className="text-muted-foreground">
              Não há imóveis disponíveis com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>

      <VitrineDisclaimer variant="footer" />
      <Footer />
    </div>
  );
}
