
# Plano: Correção do Cap Rate Mensal e Persistência de Projetos

## Problema 1: Cálculo do Cap Rate Mensal

### Fórmula Correta
```
Cap Rate Mensal = NOI Mensal / Investimento Total
```

Onde:
- **NOI Mensal** = (Aluguel Mensal Total × (1 - Vacância)) - OPEX Mensal
- **OPEX Mensal** = (IPTU + Condomínio) / 12 + (Aluguel Efetivo Mensal × Taxa Administração)
- **Investimento Total** = Aquisição + (Aquisição × % Custos Fechamento) + Reforma + Turn Key

### Verificação com Dados da Imagem
| Item | Valor |
|------|-------|
| Aluguel Mensal | R$ 73.000 |
| IPTU (mensal) | R$ 0 |
| Condomínio (mensal) | R$ 0 |
| Taxa Adm (6% de 73k) | R$ 4.380/mês |
| NOI Mensal | R$ 68.620 |
| Investimento Total | R$ 7.284.000 |
| Cap Rate Mensal | 68.620 / 7.284.000 = **0,94%** |

### O Cálculo Atual Está Correto
O código atual calcula:
```typescript
const monthlyCapRate = (calculations.noi / 12) / calculations.totalInvestment;
```

O `calculations.noi` já é o NOI Anual (Receita Efetiva - OPEX), então dividir por 12 dá o NOI Mensal.

Porém, preciso verificar se a **Taxa Administrativa** está sendo calculada corretamente (sobre o valor recebido, não sobre o valor bruto).

---

## Problema 2: Persistência - Editar Projeto Existente

### Problema Atual
Quando o usuário:
1. Abre projeto existente via Dashboard (clica "View" -> URL: `/simulador?id=xxx`)
2. Faz alterações
3. Clica "Salvar"

O sistema **cria um novo projeto** ao invés de atualizar o existente.

### Solução
Manter o `projectId` em estado quando carregado via URL e usar `UPDATE` ao invés de `INSERT`.

### Alterações Necessárias

#### 1. Adicionar Estado para Rastrear Projeto Carregado
```typescript
// Novo estado
const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

// Quando carregar projeto da URL
useEffect(() => {
  if (projectFromUrl && !loadingProjectFromUrl && !hasLoadedFromUrl) {
    handleLoadProject(projectFromUrl, false);
    setLoadedProjectId(projectFromUrl.id); // <-- Guardar ID
    setHasLoadedFromUrl(true);
  }
}, [projectFromUrl, loadingProjectFromUrl, hasLoadedFromUrl, handleLoadProject]);
```

#### 2. Modificar handleSave para Atualizar ou Criar
```typescript
const updateProject = useUpdateProject(); // Importar hook existente

const handleSave = () => {
  const projectData = {
    project_type: 'simulador' as ProjectType,
    name: projectName || `Simulação ${new Date().toLocaleDateString('pt-BR')}`,
    inputs: { ... },
    results: { ... },
  };

  if (loadedProjectId) {
    // ATUALIZAR projeto existente
    updateProject.mutate({
      id: loadedProjectId,
      ...projectData,
    });
  } else {
    // CRIAR novo projeto
    saveProject.mutate(projectData);
  }
};
```

#### 3. Limpar ID ao Criar Novo Projeto
Quando o usuário clica "Novo" ou limpa os campos, resetar o `loadedProjectId`:
```typescript
const handleNewProject = () => {
  setLoadedProjectId(null);
  setProjectName('');
  // ... resetar outros campos
};
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Simulador.tsx` | Adicionar `loadedProjectId` e lógica de update |
| `src/pages/Simulador.tsx` | Modificar `handleSave` para usar update quando apropriado |
| `src/pages/Simulador.tsx` | Atualizar `handleLoadProject` para guardar o ID |

---

## Fluxo Final

```text
┌─────────────────────────────────────────────────────────────┐
│  Usuário no Dashboard                                       │
│  Clica "View" em projeto existente                         │
├─────────────────────────────────────────────────────────────┤
│  URL: /simulador?id=8182ad50-7592-467b-b8f2-af65c97c4cce   │
│  Carrega projeto → loadedProjectId = "8182ad50..."         │
├─────────────────────────────────────────────────────────────┤
│  Usuário edita campos                                       │
│  Clica "Salvar"                                             │
├─────────────────────────────────────────────────────────────┤
│  if (loadedProjectId) → UPDATE toolbox_projects            │
│  else → INSERT toolbox_projects                             │
├─────────────────────────────────────────────────────────────┤
│  updated_at = NOW() (automático pelo Supabase)             │
│  Data mostrada no PDF reflete a edição                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Resultado Esperado

1. **Cap Rate Mensal**: Já está correto (NOI Anual / 12 / Investimento Total)
2. **Editar Projeto**: Ao abrir projeto via URL e salvar, atualiza o existente
3. **Data de Modificação**: O campo `updated_at` é atualizado automaticamente pelo Supabase
4. **PDF**: A data mostrada será a data atual (quando exportou), não quando salvou
