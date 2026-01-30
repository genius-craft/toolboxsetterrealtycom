import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PropertyFiltersProps {
  propertyType: string;
  city: string;
  transactionType: string;
  cities: string[];
  onPropertyTypeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onTransactionTypeChange: (value: string) => void;
}

const propertyTypes = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'rural', label: 'Rural' },
  { value: 'misto', label: 'Misto' },
];

const transactionTypes = [
  { value: 'all', label: 'Todos' },
  { value: 'venda', label: 'Venda' },
  { value: 'locacao', label: 'Locação' },
  { value: 'permuta', label: 'Permuta' },
];

export function PropertyFilters({
  propertyType,
  city,
  transactionType,
  cities,
  onPropertyTypeChange,
  onCityChange,
  onTransactionTypeChange,
}: PropertyFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Filtrar Imóveis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor="property-type">Tipo de Imóvel</Label>
          <Select value={propertyType} onValueChange={onPropertyTypeChange}>
            <SelectTrigger id="property-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Select value={city} onValueChange={onCityChange}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Selecione a cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction Type */}
        <div className="space-y-2">
          <Label htmlFor="transaction-type">Transação</Label>
          <Select value={transactionType} onValueChange={onTransactionTypeChange}>
            <SelectTrigger id="transaction-type">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
