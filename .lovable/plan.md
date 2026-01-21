
# Plano: Corrigir Carregamento de Projetos Salvos

## Diagnóstico

O problema identificado é que ao clicar em "Ver" no Dashboard, o sistema navega para a página da ferramenta sem passar o ID do projeto. Isso faz com que a página abra com valores padrão em vez de carregar os dados salvos.

**Dados no banco estão corretos** - verificamos que o projeto "Projeto Araçatuba" tem todos os inputs salvos corretamente (R$ 2.100.000, 3 lojas, etc.)

---

## Solução

Implementar passagem de ID via URL e carregamento automático em todas as 4 calculadoras.

---

## 1. Modificar Dashboard.tsx

Alterar o botão "Ver" para passar o ID do projeto como query parameter:

```typescript
// Antes (linha 251)
<Link to={config.path} className="flex-1">

// Depois
<Link to={`${config.path}?id=${project.id}`} className="flex-1">
```

---

## 2. Modificar Simulador.tsx

Adicionar lógica para detectar e carregar projeto da URL:

```typescript
import { useSearchParams } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';

// Dentro do componente:
const [searchParams] = useSearchParams();
const projectIdFromUrl = searchParams.get('id');
const { data: projectFromUrl, isLoading: loadingProject } = useProject(projectIdFromUrl || '');

// useEffect para carregar quando dados chegarem
useEffect(() => {
  if (projectFromUrl && !loadingProject) {
    handleLoadProject(projectFromUrl);
  }
}, [projectFromUrl, loadingProject]);
```

---

## 3. Modificar Permuta.tsx

Mesma lógica do Simulador:

```typescript
import { useSearchParams } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';

const [searchParams] = useSearchParams();
const projectIdFromUrl = searchParams.get('id');
const { data: projectFromUrl } = useProject(projectIdFromUrl || '');

useEffect(() => {
  if (projectFromUrl) {
    handleLoadProject(projectFromUrl);
  }
}, [projectFromUrl]);
```

---

## 4. Modificar Decisor.tsx

Adicionar:
1. Função `handleLoadProject` (se não existir)
2. Lógica de carregamento via URL
3. Dialog "Abrir Projeto" (se não existir)

---

## 5. Modificar HighestBestUse.tsx

Mesma implementação:
1. Adicionar hook `useSearchParams`
2. Usar `useProject` para buscar por ID
3. Criar `handleLoadProject` para popular os campos
4. useEffect para carregar automaticamente

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Dashboard.tsx` | Passar `?id={project.id}` na URL do botão "Ver" |
| `src/pages/Simulador.tsx` | Ler ID da URL e carregar projeto automaticamente |
| `src/pages/Permuta.tsx` | Ler ID da URL e carregar projeto automaticamente |
| `src/pages/Decisor.tsx` | Adicionar suporte completo a projetos salvos |
| `src/pages/HighestBestUse.tsx` | Adicionar suporte completo a projetos salvos |

---

## Fluxo Corrigido

1. Usuário salva projeto no Simulador com valores específicos
2. No Dashboard, clica em "Ver" no projeto salvo
3. Sistema navega para `/simulador?id=abc123`
4. Simulador detecta `id=abc123` na URL
5. Hook `useProject('abc123')` busca dados do Supabase
6. `useEffect` detecta que dados chegaram
7. `handleLoadProject` popula todos os campos
8. Usuário vê exatamente os valores que salvou

---

## Resultado Esperado

Após a implementação, clicar em "Ver" em qualquer projeto salvo no Dashboard irá:
- Navegar para a ferramenta correta
- Carregar automaticamente todos os valores salvos
- Mostrar os números exatos que foram salvos pelo usuário
