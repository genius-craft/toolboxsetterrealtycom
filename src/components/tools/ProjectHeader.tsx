import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building2, Hammer, MapPin, StickyNote, History } from 'lucide-react';

type InvestmentType = 'ready' | 'build-to-suit';

interface ProjectHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  investmentType: InvestmentType;
  onInvestmentTypeChange: (type: InvestmentType) => void;
  showAddress?: boolean;
  onShowAddressChange?: (show: boolean) => void;
  googleMapsLink?: string;
  onGoogleMapsLinkChange?: (link: string) => void;
  observations?: string;
  onObservationsChange?: (obs: string) => void;
  loadedProjectId?: string | null;
  onShowHistory?: () => void;
  className?: string;
}

export function ProjectHeader({
  projectName,
  onProjectNameChange,
  investmentType,
  onInvestmentTypeChange,
  showAddress,
  onShowAddressChange,
  googleMapsLink,
  onGoogleMapsLinkChange,
  observations,
  onObservationsChange,
  loadedProjectId,
  onShowHistory,
  className,
}: ProjectHeaderProps) {
  return (
    <div className={cn('bg-card rounded-lg border border-border p-4 shadow-card space-y-4', className)}>
      {/* Project Name + History */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="project-name" className="text-sm font-medium">
            Nome do Projeto
          </Label>
          {loadedProjectId && onShowHistory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onShowHistory}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <History className="h-3.5 w-3.5 mr-1" />
              Histórico
            </Button>
          )}
        </div>
        <Input
          id="project-name"
          placeholder="Ex: Edifício Centro SP"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="font-medium"
        />
      </div>

      {/* Investment Type Toggle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tipo de Investimento</Label>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => onInvestmentTypeChange('ready')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-all',
              investmentType === 'ready'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <Building2 className="h-4 w-4" />
            Compra Pronta
          </button>
          <button
            type="button"
            onClick={() => onInvestmentTypeChange('build-to-suit')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-all',
              investmentType === 'build-to-suit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <Hammer className="h-4 w-4" />
            Build-to-Suit
          </button>
        </div>
      </div>

      {/* Google Maps Address Toggle */}
      {onShowAddressChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Endereço do Imóvel</Label>
            </div>
            <Switch
              checked={showAddress ?? false}
              onCheckedChange={onShowAddressChange}
            />
          </div>
          {showAddress && onGoogleMapsLinkChange && (
            <Input
              placeholder="Cole o link do Google Maps aqui"
              value={googleMapsLink ?? ''}
              onChange={(e) => onGoogleMapsLinkChange(e.target.value)}
              className="text-sm"
            />
          )}
        </div>
      )}

      {/* Observations */}
      {onObservationsChange && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Observações</Label>
          </div>
          <Textarea
            placeholder="Anotações, premissas, contexto..."
            value={observations ?? ''}
            onChange={(e) => onObservationsChange(e.target.value)}
            maxLength={500}
            className="text-sm min-h-[80px] resize-y"
          />
          <p className="text-xs text-muted-foreground text-right">
            {(observations ?? '').length}/500
          </p>
        </div>
      )}
    </div>
  );
}
