

# Plano: Melhorias de UX em Todo o App

## Resumo
Conjunto de melhorias de experiência do usuário aplicadas em toda a plataforma, focando em feedback visual, navegação, micro-interacoes, loading states e acessibilidade.

---

## 1. Loading States e Skeleton Screens Melhorados

**Arquivos:** `Dashboard.tsx`, `Vitrine.tsx`, `VitrineDetail.tsx`

- Substituir skeletons genéricos por skeletons que imitam o layout real dos cards (ícone + título + stats)
- Adicionar animação de shimmer nos skeletons em vez de apenas `animate-pulse`
- No `VitrineDetail`, adicionar skeleton completo em vez de apenas um spinner centralizado

---

## 2. Transicoes de Pagina e Animacoes de Entrada

**Arquivos:** `ToolLayout.tsx`, `AppLayout.tsx`, `Dashboard.tsx`

- Adicionar `animate-fade-up` nas seções principais ao montar
- Stagger nas listas de cards (projetos, ferramentas) para entrada sequencial
- Transição suave no conteúdo do sidebar ao expandir/colapsar

---

## 3. Feedback Visual nas Ações do Usuário

**Arquivos:** `Simulador.tsx`, `Decisor.tsx`, `Permuta.tsx`, `PrecoTeto.tsx`, `HighestBestUse.tsx`

- Botão "Salvar" com estado de loading (spinner) e texto dinâmico ("Salvando..." -> "Salvo!")
- Botão "Exportar PDF" com barra de progresso ou spinner durante geração
- Toast de sucesso com ícone de check animado
- Desabilitar botões duplicados durante operações assíncronas

---

## 4. Navegação e Orientação

**Arquivos:** `AppSidebar.tsx`, `AppLayout.tsx`

- Adicionar breadcrumb na header do AppLayout (ex: "Dashboard > Simulador")
- Tooltip nos itens do sidebar quando colapsado (já existe, verificar se funciona)
- Highlight mais visível no item ativo do sidebar (borda lateral dourada em vez de fundo solid)
- Adicionar link "Voltar ao site" no sidebar footer

---

## 5. Empty States Mais Atraentes

**Arquivos:** `Dashboard.tsx`

- Redesenhar empty state com ilustração ou ícone maior
- Adicionar CTA mais claro: "Crie sua primeira análise" com cards clicáveis das ferramentas
- Adicionar descrição breve de cada ferramenta no empty state

---

## 6. Melhorias Mobile

**Arquivos:** `ToolLayout.tsx`, `Navbar.tsx`, `CookieConsent.tsx`, `WhatsAppButton.tsx`

- Cookie consent: posicionar acima do botão WhatsApp para não sobrepor
- WhatsApp button: z-index mais alto e posição que não obstrui conteúdo
- Mobile menu no Navbar: adicionar backdrop escuro ao abrir
- ToolLayout mobile: substituir "Resultados abaixo" estático por botão "Ver Resultados" que faz smooth scroll

---

## 7. Formulários e Inputs

**Arquivos:** `AuthModal.tsx`, `ProjectHeader.tsx`, `CurrencyInput.tsx`

- AuthModal: adicionar indicador de força da senha no signup
- AuthModal: melhorar transição entre login/signup com animação
- ProjectHeader: campo de nome com auto-focus ao montar
- Inputs monetários: feedback visual quando o valor muda (flash sutil)

---

## 8. Micro-interações

**Arquivos:** `CollapsibleInputCard.tsx`, `KPICard.tsx`, `VerdictBadge.tsx`

- CollapsibleInputCard: animação de rotação mais suave no chevron
- KPICard: animação de contagem (count-up) nos números ao montar
- VerdictBadge: animação de entrada com scale + bounce

---

## Detalhes Técnicos

- Todas as animações usam CSS/Tailwind (sem lib extra)
- Prioridade em performance: `will-change` e `transform` para animações GPU
- Nenhuma migration de banco necessária
- Mudanças retrocompatíveis
- Total de ~12-15 arquivos modificados
- Utilização de `framer-motion` nao necessária — tudo com CSS transitions e keyframes

