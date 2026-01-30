import { Calculator, ArrowLeftRight, TrendingUp, Scale, DollarSign, LayoutGrid } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectFiltersProps {
  projectType: string;
  onProjectTypeChange: (value: string) => void;
}

const projectTypes = [
  { value: 'all', label: 'Todos os Tipos', icon: LayoutGrid },
  { value: 'simulador', label: 'Simulador', icon: Calculator },
  { value: 'permuta', label: 'Permuta', icon: ArrowLeftRight },
  { value: 'highest-best-use', label: 'Highest & Best Use', icon: TrendingUp },
  { value: 'decisor', label: 'Decisor', icon: Scale },
  { value: 'preco-teto', label: 'Preço Teto', icon: DollarSign },
];

export function ProjectFilters({ projectType, onProjectTypeChange }: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={projectType} onValueChange={onProjectTypeChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          {projectTypes.map((type) => {
            const Icon = type.icon;
            return (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
