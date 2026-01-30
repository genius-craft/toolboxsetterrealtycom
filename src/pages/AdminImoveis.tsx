import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PropertyForm } from '@/components/vitrine/PropertyForm';
import { 
  useAdminProperties, 
  useCreateProperty, 
  useUpdateProperty, 
  useDeleteProperty,
  useToggleVitrine,
  type AdminProperty,
  type PropertyFormData,
} from '@/hooks/useAdminProperties';
import { useAdminRole } from '@/hooks/useAdminRole';
import { formatCurrency } from '@/lib/formatters';

const propertyTypeLabels: Record<string, string> = {
  terreno: 'Terreno',
  comercial: 'Comercial',
  residencial: 'Residencial',
  industrial: 'Industrial',
  rural: 'Rural',
  misto: 'Misto',
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  available: { label: 'Disponível', variant: 'default' },
  reserved: { label: 'Reservado', variant: 'secondary' },
  sold: { label: 'Vendido', variant: 'destructive' },
};

export default function AdminImoveis() {
  const { isLoading: roleLoading, isAuthorized } = useAdminRole();
  const { data: properties, isLoading } = useAdminProperties();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const toggleVitrine = useToggleVitrine();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingProperty(null);
    setFormOpen(true);
  };

  const handleEdit = (property: AdminProperty) => {
    setEditingProperty(property);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    if (editingProperty) {
      await updateProperty.mutateAsync({ id: editingProperty.id, formData: data });
    } else {
      await createProperty.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingProperty(null);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteProperty.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleToggleVitrine = async (id: string, currentValue: boolean) => {
    await toggleVitrine.mutateAsync({ id, show: !currentValue });
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Imóveis</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os imóveis da vitrine
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Imóvel
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[60px]">Foto</TableHead>
              <TableHead>Imóvel</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Vitrine</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !properties?.length ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="h-8 w-8" />
                    <p>Nenhum imóvel cadastrado</p>
                    <Button variant="link" onClick={handleCreate}>
                      Cadastrar primeiro imóvel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    {property.image_url ? (
                      <img
                        src={property.image_url}
                        alt={property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="font-medium truncate">{property.title}</p>
                      {property.neighborhood && (
                        <p className="text-sm text-muted-foreground truncate">
                          {property.neighborhood}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.property_type && (
                      <Badge variant="outline">
                        {propertyTypeLabels[property.property_type] || property.property_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {property.city && (
                      <span className="text-sm">
                        {property.city}{property.state && `, ${property.state}`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {property.price ? formatCurrency(property.price) : '-'}
                  </TableCell>
                  <TableCell>
                    {property.status && statusLabels[property.status] && (
                      <Badge variant={statusLabels[property.status].variant}>
                        {statusLabels[property.status].label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={property.show_in_vitrine || false}
                        onCheckedChange={() => handleToggleVitrine(property.id, property.show_in_vitrine || false)}
                        disabled={toggleVitrine.isPending}
                      />
                      {property.show_in_vitrine ? (
                        <Eye className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(property)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(property.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? 'Editar Imóvel' : 'Novo Imóvel'}
            </DialogTitle>
          </DialogHeader>
          <PropertyForm
            property={editingProperty}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditingProperty(null);
            }}
            isLoading={createProperty.isPending || updateProperty.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Imóvel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProperty.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
