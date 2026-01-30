

# Plano: Vitrine de Empreendimentos

## Resumo

Criar uma **Vitrine de Imóveis** onde administradores cadastram propriedades e o público pode apenas visualizar. Os cards seguirão o mesmo estilo visual das ferramentas do Dashboard.

---

## Fluxo de Uso

```text
ADMINISTRADOR                           PÚBLICO
+----------------------------+          +----------------------------+
|                            |          |                            |
|  /admin/imoveis            |          |  /vitrine                  |
|  - Cadastrar imóvel        |          |  - Ver cards de imóveis    |
|  - Editar dados            |          |  - Filtrar por tipo/cidade |
|  - Upload de imagem        |          |  - Ver detalhes            |
|  - Toggle "Exibir"         |  ----->  |  - Botão WhatsApp          |
|                            |          |                            |
+----------------------------+          +----------------------------+
        (CRUD completo)                      (Somente leitura)
```

---

## Alterações no Banco de Dados

### 1. Adicionar campo `show_in_vitrine`

A tabela `properties` já existe com todos os campos necessários. Será adicionado apenas um campo booleano para controlar a exibição na vitrine:

```sql
ALTER TABLE properties
ADD COLUMN show_in_vitrine BOOLEAN DEFAULT false;
```

### 2. Atualizar políticas RLS

Adicionar política que permite qualquer pessoa visualizar imóveis marcados para exibição:

```sql
CREATE POLICY "Anyone can view vitrine properties"
ON properties FOR SELECT
USING (show_in_vitrine = true AND status = 'available');
```

---

## Páginas a Criar

### 1. `/vitrine` - Listagem Pública

**Estrutura:**
- Header com título e disclaimer legal (CRECI)
- Filtros: tipo de imóvel, cidade, transação (venda/locação)
- Grid de cards no estilo do Dashboard
- Cada card mostra: imagem, título, cidade, preço, área, cap rate (se disponível)
- Click no card abre modal ou página de detalhes

**Card de Imóvel (mesmo estilo do Dashboard):**
```text
+--------------------------------+
|  [IMAGEM DO IMÓVEL]            |
|--------------------------------|
|  🏢 Comercial | Venda          |
|                                |
|  Título do Imóvel              |
|  Cidade, Estado                |
|                                |
|  R$ 2.500.000                  |
|  450m² | Cap Rate: 8.5%        |
|                                |
|  [Ver Detalhes]                |
+--------------------------------+
```

### 2. `/vitrine/:id` - Detalhes do Imóvel

**Seções:**
- Galeria de imagens
- Informações completas (área, tipo, vocação)
- Métricas financeiras (preço, cap rate)
- Localização (bairro, cidade - sem endereço exato para não-logados)
- Botão "Falar com Corretor" (WhatsApp)
- Disclaimer legal fixo no rodapé

### 3. `/admin/imoveis` - Gestão de Imóveis (Admin)

**Funcionalidades:**
- Listagem de todos os imóveis (tabela)
- Criar novo imóvel (formulário)
- Editar imóvel existente
- **Toggle "Exibir na Vitrine"** (campo `show_in_vitrine`)
- Upload de imagem para bucket `property-images`
- Excluir imóvel

---

## Componentes a Criar

| Componente | Descrição |
|------------|-----------|
| `src/pages/Vitrine.tsx` | Página pública com grid de imóveis |
| `src/pages/VitrineDetail.tsx` | Detalhes de um imóvel específico |
| `src/pages/AdminImoveis.tsx` | Gestão de imóveis (admin) |
| `src/components/vitrine/PropertyCard.tsx` | Card de imóvel (estilo Dashboard) |
| `src/components/vitrine/PropertyFilters.tsx` | Filtros da vitrine |
| `src/components/vitrine/PropertyForm.tsx` | Formulário de cadastro/edição |
| `src/components/vitrine/VitrineDisclaimer.tsx` | Aviso legal obrigatório |
| `src/hooks/useVitrineProperties.ts` | Hook para buscar imóveis públicos |
| `src/hooks/useAdminProperties.ts` | Hook para CRUD de imóveis (admin) |

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/App.tsx` | Adicionar rotas `/vitrine`, `/vitrine/:id`, `/admin/imoveis` |
| `src/components/layout/AppSidebar.tsx` | Adicionar "Vitrine" no menu principal e "Imóveis" no admin |
| `src/components/Navbar.tsx` | Adicionar link "Vitrine" na landing page |
| `src/components/Footer.tsx` | Adicionar link "Vitrine" |

---

## Disclaimer Legal Obrigatório

Será exibido em todas as páginas da vitrine:

```text
AVISO LEGAL: Esta vitrine tem caráter exclusivamente informativo.
A intermediação de compra, venda ou locação de imóveis é realizada
por corretor inscrito no CRECI. Esta plataforma não constitui oferta
de valores mobiliários nos termos da regulamentação da CVM.
```

---

## Segurança e Permissões

| Ação | Quem pode |
|------|-----------|
| Ver imóveis na vitrine | Qualquer pessoa |
| Ver detalhes do imóvel | Qualquer pessoa |
| Cadastrar imóvel | Apenas admin |
| Editar imóvel | Apenas admin |
| Excluir imóvel | Apenas admin |
| Toggle exibir/ocultar | Apenas admin |

---

## Resumo de Arquivos

| Arquivo | Ação |
|---------|------|
| Database migration | Adicionar `show_in_vitrine` e política RLS |
| `src/pages/Vitrine.tsx` | **CRIAR** |
| `src/pages/VitrineDetail.tsx` | **CRIAR** |
| `src/pages/AdminImoveis.tsx` | **CRIAR** |
| `src/components/vitrine/PropertyCard.tsx` | **CRIAR** |
| `src/components/vitrine/PropertyFilters.tsx` | **CRIAR** |
| `src/components/vitrine/PropertyForm.tsx` | **CRIAR** |
| `src/components/vitrine/VitrineDisclaimer.tsx` | **CRIAR** |
| `src/hooks/useVitrineProperties.ts` | **CRIAR** |
| `src/hooks/useAdminProperties.ts` | **CRIAR** |
| `src/App.tsx` | Modificar (adicionar rotas) |
| `src/components/layout/AppSidebar.tsx` | Modificar (adicionar links) |
| `src/components/Navbar.tsx` | Modificar (adicionar link) |
| `src/components/Footer.tsx` | Modificar (adicionar link) |

---

## Ordem de Implementação

1. Migração do banco de dados (campo `show_in_vitrine` + política RLS)
2. Hooks de dados (`useVitrineProperties`, `useAdminProperties`)
3. Componentes reutilizáveis (PropertyCard, Disclaimer)
4. Página admin `/admin/imoveis` (CRUD completo)
5. Página pública `/vitrine` (listagem)
6. Página de detalhes `/vitrine/:id`
7. Navegação (sidebar, navbar, footer)

