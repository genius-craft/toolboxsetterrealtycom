import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeErrorMessage } from '@/lib/errorMessages';
import { cn } from '@/lib/utils';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  const colors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-green-500'];

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < score ? colors[score] : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs', score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : 'text-green-600')}>
        Senha {labels[score]}
      </p>
    </div>
  );
}

const categories = [
  { value: 'corretor', label: 'Corretor' },
  { value: 'investidor', label: 'Investidor' },
  { value: 'proprietario', label: 'Proprietário' },
  { value: 'rede_varejo', label: 'Rede de Varejo' },
];

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Erro ao entrar',
            description: sanitizeErrorMessage(error),
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Bem-vindo de volta!',
            description: 'Login realizado com sucesso.',
          });
          onOpenChange(false);
        }
      } else {
        const { error } = await signUp(email, password, name, phone, category);
        if (error) {
          toast({
            title: 'Erro ao criar conta',
            description: sanitizeErrorMessage(error),
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Cadastro enviado!',
            description: 'Sua conta será analisada pela Setter. Você receberá acesso após aprovação.',
          });
          onOpenChange(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Categoria
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione sua categoria" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-accent hover:underline font-medium"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-accent hover:underline font-medium"
              >
                Entrar
              </button>
            </>
              )}
            </div>
            {mode === 'signup' && password.length > 0 && (
              <PasswordStrength password={password} />
            )}
      </DialogContent>
    </Dialog>
  );
}
