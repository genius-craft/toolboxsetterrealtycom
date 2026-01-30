import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUploadPropertyImage, type PropertyFormData, type AdminProperty } from '@/hooks/useAdminProperties';

const formSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0).optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  neighborhood: z.string().optional(),
  area_sqm: z.number().min(0).optional().or(z.literal('')),
  built_area_sqm: z.number().min(0).optional().or(z.literal('')),
  land_area_sqm: z.number().min(0).optional().or(z.literal('')),
  front_meters: z.number().min(0).optional().or(z.literal('')),
  property_type: z.string().optional(),
  transaction_type: z.string().optional(),
  vocation: z.string().optional(),
  target_business_niche: z.string().optional(),
  cap_rate: z.number().min(0).max(100).optional().or(z.literal('')),
  google_maps_link: z.string().url().optional().or(z.literal('')),
  latitude: z.number().optional().or(z.literal('')),
  longitude: z.number().optional().or(z.literal('')),
  is_featured: z.boolean().optional(),
  is_opportunity: z.boolean().optional(),
  status: z.string().optional(),
  show_in_vitrine: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
  property?: AdminProperty | null;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const propertyTypes = [
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'residencial', label: 'Residencial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'rural', label: 'Rural' },
  { value: 'misto', label: 'Misto' },
];

const transactionTypes = [
  { value: 'venda', label: 'Venda' },
  { value: 'locacao', label: 'Locação' },
  { value: 'permuta', label: 'Permuta' },
];

const statusOptions = [
  { value: 'available', label: 'Disponível' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'sold', label: 'Vendido' },
];

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
];

export function PropertyForm({ property, onSubmit, onCancel, isLoading }: PropertyFormProps) {
  const [imageUrl, setImageUrl] = useState<string>(property?.image_url || '');
  const uploadImage = useUploadPropertyImage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: property?.title || '',
      description: property?.description || '',
      price: property?.price || '',
      address: property?.address || '',
      city: property?.city || '',
      state: property?.state || '',
      neighborhood: property?.neighborhood || '',
      area_sqm: property?.area_sqm || '',
      built_area_sqm: property?.built_area_sqm || '',
      land_area_sqm: property?.land_area_sqm || '',
      front_meters: property?.front_meters || '',
      property_type: property?.property_type || '',
      transaction_type: property?.transaction_type || 'venda',
      vocation: property?.vocation || '',
      target_business_niche: property?.target_business_niche || '',
      cap_rate: property?.cap_rate || '',
      google_maps_link: property?.google_maps_link || '',
      latitude: property?.latitude || '',
      longitude: property?.longitude || '',
      is_featured: property?.is_featured || false,
      is_opportunity: property?.is_opportunity || false,
      status: property?.status || 'available',
      show_in_vitrine: property?.show_in_vitrine || false,
    },
  });

  useEffect(() => {
    if (property) {
      setImageUrl(property.image_url || '');
    }
  }, [property]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage.mutateAsync(file);
    setImageUrl(url);
  };

  const handleSubmit = (values: FormValues) => {
    const cleanData: PropertyFormData = {
      title: values.title,
      description: values.description || undefined,
      price: typeof values.price === 'number' ? values.price : undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      neighborhood: values.neighborhood || undefined,
      area_sqm: typeof values.area_sqm === 'number' ? values.area_sqm : undefined,
      built_area_sqm: typeof values.built_area_sqm === 'number' ? values.built_area_sqm : undefined,
      land_area_sqm: typeof values.land_area_sqm === 'number' ? values.land_area_sqm : undefined,
      front_meters: typeof values.front_meters === 'number' ? values.front_meters : undefined,
      property_type: values.property_type || undefined,
      transaction_type: values.transaction_type || undefined,
      vocation: values.vocation || undefined,
      target_business_niche: values.target_business_niche || undefined,
      cap_rate: typeof values.cap_rate === 'number' ? values.cap_rate : undefined,
      google_maps_link: values.google_maps_link || undefined,
      latitude: typeof values.latitude === 'number' ? values.latitude : undefined,
      longitude: typeof values.longitude === 'number' ? values.longitude : undefined,
      is_featured: values.is_featured,
      is_opportunity: values.is_opportunity,
      status: values.status,
      show_in_vitrine: values.show_in_vitrine,
      image_url: imageUrl || undefined,
    };

    onSubmit(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Imagem do Imóvel</Label>
          <div className="flex items-start gap-4">
            {imageUrl ? (
              <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-border">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-40 h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadImage.isPending}
                />
                {uploadImage.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Título *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Terreno comercial em área nobre" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Descreva o imóvel..." rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="property_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Imóvel</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Transação</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0,00" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Rua, número" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Bairro" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Cidade" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brazilianStates.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="google_maps_link"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel>Link do Google Maps</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://maps.google.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Areas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="area_sqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Total (m²)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="built_area_sqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área Construída (m²)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="land_area_sqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área do Terreno (m²)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="front_meters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Testada (m)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="vocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vocação</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Residencial vertical" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_business_niche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nicho de Negócio</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Incorporação" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cap_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cap Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    {...field} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0.0" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
          <FormField
            control={form.control}
            name="show_in_vitrine"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Exibir na Vitrine</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Destaque</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_opportunity"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Oportunidade</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {property ? 'Salvar Alterações' : 'Criar Imóvel'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
