

# Plano: Atualização do Número de Ferramentas (4 → 5)

## Objetivo

Atualizar todas as referências ao número de ferramentas no projeto de **4** para **5**, refletindo a adição da nova calculadora "Preço Teto".

---

## Alterações Necessárias

### 1. `src/components/HeroSection.tsx` (Linha 78)

**Antes:**
```text
4
Ferramentas Pro
```

**Depois:**
```text
5
Ferramentas Pro
```

---

### 2. `src/components/ToolsSection.tsx` (Linha 81)

**Antes:**
```text
4 Calculadoras Profissionais
```

**Depois:**
```text
5 Calculadoras Profissionais
```

Também será necessário **adicionar o card da nova ferramenta** no array `tools`:

```typescript
{
  icon: Target,
  title: "Preço Teto",
  path: "/preco-teto",
  description:
    "Descubra o valor máximo que pode pagar por um imóvel para atingir seu retorno alvo de TIR ou Cap Rate.",
  features: [
    "Cálculo por TIR ou Cap Rate",
    "Busca binária otimizada",
    "Margem de negociação",
    "Comparativo visual",
  ],
  color: "from-rose-500/20 to-pink-500/10",
}
```

---

### 3. `src/components/Footer.tsx` (Linhas 79-112)

Adicionar link para a nova ferramenta na lista de Ferramentas do rodapé:

**Adicionar após "Decisor Go/No-Go":**
```tsx
<li>
  <Link
    to="/preco-teto"
    className="text-primary-foreground/40 hover:text-accent transition-colors"
  >
    Preço Teto
  </Link>
</li>
```

---

## Resumo das Alterações

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `src/components/HeroSection.tsx` | 78 | Mudar `4` para `5` |
| `src/components/ToolsSection.tsx` | 81 | Mudar "4 Calculadoras" para "5 Calculadoras" |
| `src/components/ToolsSection.tsx` | 5-62 | Adicionar card "Preço Teto" ao array |
| `src/components/ToolsSection.tsx` | 1 | Adicionar import do ícone `Target` |
| `src/components/Footer.tsx` | ~112 | Adicionar link "Preço Teto" |

---

## Nota

Essas alterações fazem parte da implementação completa da ferramenta "Preço Teto" que já foi planejada anteriormente. Serão implementadas junto com a criação da nova página e toda a lógica de cálculo.

