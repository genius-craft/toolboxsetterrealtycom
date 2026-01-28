

# Plano: Atualizar Aba do Navegador com Nome e Logo

## Objetivo

Atualizar a aba do navegador para exibir:
1. **Título**: "Setter Toolbox"
2. **Favicon**: Logo da empresa fornecido

---

## Alterações Necessárias

### 1. Copiar Logo para o Projeto

Copiar o arquivo de imagem enviado para a pasta `public/`:

```
user-uploads://image-16.png → public/favicon.png
```

### 2. Atualizar `index.html`

**Antes:**
```html
<title>Lovable App</title>
<meta name="description" content="Lovable Generated Project" />
<meta name="author" content="Lovable" />
<meta property="og:title" content="Lovable App" />
```

**Depois:**
```html
<link rel="icon" type="image/png" href="/favicon.png" />
<title>Setter Toolbox</title>
<meta name="description" content="Ferramentas de análise imobiliária para corretores" />
<meta name="author" content="Setter Realty" />
<meta property="og:title" content="Setter Toolbox" />
```

---

## Resultado Esperado

A aba do navegador exibirá:

```text
+---------------------------+
| [Logo] Setter Toolbox     |
+---------------------------+
```

---

## Resumo Técnico

| Ação | Arquivo |
|------|---------|
| Copiar imagem | `user-uploads://image-16.png` → `public/favicon.png` |
| Atualizar título e favicon | `index.html` |

