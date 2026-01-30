import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAdminRole } from '@/hooks/useAdminRole';
import { validateProfile, validateUserCreation, getValidationError } from '@/lib/validation';
import { sanitizeErrorMessage } from '@/lib/errorMessages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, X, Loader2, Users, Clock, CheckCircle, Pencil, Trash2, UserPlus, Eye, EyeOff, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AppRole = 'admin' | 'super_admin' | 'user' | 'hunter';

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  category: string | null;
  approved: boolean;
  approved_at: string | null;
  created_at: string | null;
  email?: string;
}

const categoryLabels: Record<string, string> = {
  corretor: 'Corretor',
  investidor: 'Investidor',
  proprietario: 'Proprietário',
  rede_varejo: 'Rede de Varejo',
};

const categoryOptions = [
  { value: 'corretor', label: 'Corretor' },
  { value: 'investidor', label: 'Investidor' },
  { value: 'proprietario', label: 'Proprietário' },
  { value: 'rede_varejo', label: 'Rede de Varejo' },
];

const roleLabels: Record<AppRole, string> = {
  user: 'Usuário',
  hunter: 'Hunter',
  admin: 'Administrador',
  super_admin: 'Super Administrador',
};

const roleOptions: { value: AppRole; label: string }[] = [
  { value: 'user', label: 'Usuário' },
  { value: 'hunter', label: 'Hunter' },
  { value: 'admin', label: 'Administrador' },
  { value: 'super_admin', label: 'Super Administrador' },
];

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Server-side role verification
  const { isLoading: roleLoading, isAuthorized, isSuperAdmin } = useAdminRole({
    requiredRoles: ['admin', 'super_admin'],
    redirectTo: '/dashboard',
  });

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, AppRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<AppRole>('user');

  useEffect(() => {
    if (isAuthorized) {
      fetchProfiles();
      fetchUserRoles();
    }
  }, [isAuthorized]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (error) throw error;
      
      // Group roles by user_id
      const rolesMap: Record<string, AppRole[]> = {};
      (data || []).forEach((row) => {
        if (!rolesMap[row.user_id]) {
          rolesMap[row.user_id] = [];
        }
        rolesMap[row.user_id].push(row.role as AppRole);
      });
      setUserRoles(rolesMap);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  // Get highest role for a user
  const getHighestRole = (userId: string): AppRole => {
    const roles = userRoles[userId] || [];
    if (roles.includes('super_admin')) return 'super_admin';
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('hunter')) return 'hunter';
    return 'user';
  };

  const handleApprove = async (profile: UserProfile) => {
    setActionLoading(profile.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Usuário aprovado!',
        description: `${profile.name || 'Usuário'} agora pode acessar o sistema.`,
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (profile: UserProfile) => {
    setActionLoading(profile.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Cadastro rejeitado',
        description: 'O usuário foi removido do sistema.',
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Open edit modal with user data
  const openEditModal = (profile: UserProfile) => {
    setEditingUser(profile);
    setFormName(profile.name || '');
    setFormPhone(profile.phone || '');
    setFormCategory(profile.category || '');
    setFormRole(getHighestRole(profile.user_id));
    setIsEditModalOpen(true);
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    // Prevent self-demotion
    if (userId === user?.id) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode alterar seu próprio perfil de acesso.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, delete existing roles for this user (except 'user' which is implicit)
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // If new role is not 'user', insert the new role
      if (newRole !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast({
        title: 'Perfil atualizado!',
        description: `O usuário agora é ${roleLabels[newRole]}.`,
      });

      fetchUserRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil de acesso.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit save with validation
  const handleEditSave = async () => {
    if (!editingUser) return;

    // Validate profile data
    const validation = validateProfile({
      name: formName,
      phone: formPhone,
      category: formCategory || null,
    });

    if (!validation.success) {
      toast({
        title: 'Dados inválidos',
        description: getValidationError(validation),
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(editingUser.id);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: validation.data.name,
          phone: validation.data.phone,
          category: validation.data.category,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      // Update role if super_admin and role changed
      if (isSuperAdmin && formRole !== getHighestRole(editingUser.user_id)) {
        await handleRoleChange(editingUser.user_id, formRole);
      }

      toast({
        title: 'Usuário atualizado!',
        description: 'Os dados foram salvos com sucesso.',
      });

      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Erro',
        description: sanitizeErrorMessage(error, 'Não foi possível atualizar o usuário.'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirmUser) return;
    setActionLoading(deleteConfirmUser.id);

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteConfirmUser.id);

      if (error) throw error;

      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido do sistema.',
      });

      setDeleteConfirmUser(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Open add modal
  const openAddModal = () => {
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCategory('');
    setFormPassword('');
    setShowPassword(false);
    setFormRole('user');
    setIsAddModalOpen(true);
  };

  // Handle add new user with validation
  const handleAddUser = async () => {
    // Validate user creation data
    const validation = validateUserCreation({
      email: formEmail,
      password: formPassword,
      name: formName || null,
      phone: formPhone || null,
      category: formCategory || null,
    });

    if (!validation.success) {
      toast({
        title: 'Dados inválidos',
        description: getValidationError(validation),
        variant: 'destructive',
      });
      return;
    }

    setActionLoading('new');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        throw new Error('Não autenticado');
      }

      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: validation.data.email,
          password: validation.data.password,
          name: validation.data.name,
          phone: validation.data.phone,
          category: validation.data.category,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar usuário');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      // If super_admin and a role was selected, assign it
      if (isSuperAdmin && formRole !== 'user' && response.data?.user?.id) {
        await supabase
          .from('user_roles')
          .insert({ user_id: response.data.user.id, role: formRole });
      }

      toast({
        title: 'Usuário criado!',
        description: `${formName || formEmail} foi adicionado com sucesso.`,
      });

      setIsAddModalOpen(false);
      fetchProfiles();
      fetchUserRoles();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Erro',
        description: sanitizeErrorMessage(error, 'Não foi possível criar o usuário.'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingUsers = profiles.filter((p) => !p.approved);
  const approvedUsers = profiles.filter((p) => p.approved);

  // Show loading state while verifying role or loading data
  if (roleLoading || !isAuthorized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{approvedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Usuários Pendentes
          </CardTitle>
          <CardDescription>
            Usuários que aguardam aprovação para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum usuário pendente de aprovação
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{profile.phone || '-'}</TableCell>
                    <TableCell>
                      {profile.category ? (
                        <Badge variant="outline" className="bg-muted">
                          {categoryLabels[profile.category] || profile.category}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {profile.created_at
                        ? format(new Date(profile.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleApprove(profile)}
                          disabled={actionLoading === profile.id}
                        >
                          {actionLoading === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-1">Aprovar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(profile)}
                          disabled={actionLoading === profile.id}
                        >
                          {actionLoading === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="ml-1">Rejeitar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Usuários Aprovados
            </CardTitle>
            <CardDescription>
              Usuários com acesso liberado ao sistema
            </CardDescription>
          </div>
          <Button onClick={openAddModal} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum usuário aprovado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Data de Aprovação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedUsers.map((profile) => {
                  const highestRole = getHighestRole(profile.user_id);
                  return (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.name || 'Sem nome'}
                      </TableCell>
                      <TableCell>{profile.phone || '-'}</TableCell>
                      <TableCell>
                        {profile.category ? (
                          <Badge variant="outline" className="bg-muted">
                            {categoryLabels[profile.category] || profile.category}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            highestRole === 'super_admin' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : highestRole === 'admin'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : highestRole === 'hunter'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-muted'
                          }
                        >
                          {highestRole === 'super_admin' && <Shield className="h-3 w-3 mr-1" />}
                          {roleLabels[highestRole]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile.approved_at
                          ? format(new Date(profile.approved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Aprovado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditModal(profile)}
                            disabled={actionLoading === profile.id}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteConfirmUser(profile)}
                            disabled={actionLoading === profile.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role selection - only for super_admin */}
            {isSuperAdmin && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Perfil de Acesso
                  </Label>
                  <Select 
                    value={formRole} 
                    onValueChange={(value) => setFormRole(value as AppRole)}
                    disabled={editingUser?.user_id === user?.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingUser?.user_id === user?.id && (
                    <p className="text-xs text-muted-foreground">
                      Você não pode alterar seu próprio perfil de acesso.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={actionLoading === editingUser?.id}>
              {actionLoading === editingUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nome</Label>
              <Input
                id="add-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Telefone</Label>
              <Input
                id="add-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-category">Categoria</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Senha *</Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Senha do usuário"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Role selection - only for super_admin */}
            {isSuperAdmin && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="add-role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Perfil de Acesso
                  </Label>
                  <Select 
                    value={formRole} 
                    onValueChange={(value) => setFormRole(value as AppRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={actionLoading === 'new'}>
              {actionLoading === 'new' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmUser} onOpenChange={(open) => !open && setDeleteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir {deleteConfirmUser?.name || 'este usuário'}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === deleteConfirmUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
