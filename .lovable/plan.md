
# Manual de Funcionamento — Setter Toolbox v2 (PDF profissional)

## O que será entregue

Um único arquivo **PDF completo (~28-32 páginas)** em `/mnt/documents/manual-setter-toolbox-v2.pdf`, em português, com capa, índice, screenshots reais, exemplos numéricos e linguagem acessível para leitores não-técnicos. Cada seção responde: **o que é**, **para que serve**, **como funciona**, **para quem é**.

## Estrutura do manual

```text
1.  Capa + identidade visual (logo S, paleta navy/accent)
2.  Sumário executivo (1 pág) — o que é o Setter Toolbox em 1 página
3.  Índice (1 pág)
4.  Como começar (1-2 págs) — login, aprovação, sidebar, salvar projetos
5.  Calculadora 1 — Simulador de Viabilidade (4 págs)
6.  Calculadora 2 — Permuta (3-4 págs)
7.  Calculadora 3 — Highest & Best Use (3-4 págs)
8.  Calculadora 4 — Decisor Go/No-Go (3 págs)
9.  Calculadora 5 — Preço Teto (3 págs)
10. Recursos de IA integrados (4-5 págs)
11. Vitrine pública de simulações (1-2 págs)
12. Comparador de projetos (1 pág)
13. Exportação PDF e dashboard administrativo (1-2 págs)
14. Glossário rápido (Cap Rate, TIR, VPL, NOI, Strike, Score) (1 pág)
15. Disclaimer CVM e contato (1 pág)
```

## Padrão de cada calculadora (4 páginas-modelo)

Cada uma das 5 calculadoras seguirá esse template:

- **O que é** — 2-3 linhas em linguagem comum (sem jargão).
- **Para que serve** — situação-problema concreta ("você recebeu um anúncio de sala comercial e quer saber se o aluguel paga o investimento").
- **Para quem é** — exemplos com persona (ex.: "Investidor pessoa física comprando primeira sala", "Corretor preparando proposta", "Proprietário avaliando terreno herdado").
- **Como funciona** — passo a passo numerado (1. Você informa X, 2. A ferramenta calcula Y, 3. Aparecem KPIs Z).
- **Screenshot real** da calculadora preenchida (capturada no preview).
- **KPIs explicados** — tabela com cada métrica que aparece no resultado e o que ela significa.
- **Exemplo prático** com números fictícios e leitura do resultado ("Cap Rate de 0,62% a.m. = retorno mensal saudável; payback ~13 anos").
- **Dicas de uso** — armadilhas comuns e boas práticas.

## Seção de IA (detalhada)

Bloco dedicado explicando os 5 recursos de IA recém-implementados, com screenshots dos botões/cards:

1. **✨ Preencher com IA (AutoFill)** — como colar um anúncio e a IA preenche os campos. Caixa "exemplo de prompt" para cada calculadora.
2. **Parecer da IA (Análise crítica)** — como o card aparece após calcular, com bullets de Pontos Fortes / Riscos / Recomendações.
3. **Gerar copy da Vitrine** — botão no diálogo de publicação que cria título e descrição comerciais.
4. **Resumo executivo no PDF** — checkbox no export que adiciona parágrafo profissional na primeira página.
5. **Parecer comparativo** — bloco no /compare com vencedor recomendado e trade-offs.

Inclui: limites de uso (rate limit), o que fazer quando aparecer "limite atingido", e nota de segurança ("a IA não envia seus dados para terceiros, roda no Lovable AI Gateway").

## Como será gerado (técnico)

1. **Capturar screenshots** via `browser--navigate_to_sandbox` + `browser--screenshot` em viewport 1280x720, percorrendo: dashboard, cada uma das 5 calculadoras (com dados de exemplo já preenchidos via formulário ou estado vazio), modal AutoFill, card Parecer da IA, vitrine pública, comparador, dialog de export PDF. ~15-18 screenshots.
2. **Salvar imagens** em `/tmp/manual-shots/` e referenciar no script Python.
3. **Gerar PDF** com **ReportLab** (Platypus) — capa colorida (paleta navy/accent da marca), tipografia Helvetica/Helvetica-Bold, seções com headings, paragrafos justificados, tabelas de KPIs, screenshots inseridos com legenda, rodapé com paginação.
4. **QA visual** — converter o PDF para imagens (`pdftoppm`) e revisar cada página, corrigindo overflow, cortes, baixo contraste e alinhamento até passar limpo.
5. **Entregar** com tag `<lov-artifact>` apontando para `/mnt/documents/manual-setter-toolbox-v2.pdf`.

## Pré-requisito de login para screenshots

Para capturar telas das calculadoras autenticadas, precisamos que você esteja logado no preview (rota `/dashboard` já está aberta — o que indica sessão ativa). Vou usar a sessão atual; se algum screenshot cair em tela de login eu paro e te aviso.

## Tempo estimado

~5-8 minutos: ~2 min para capturar screenshots, ~1 min para o script ReportLab, ~2 min para QA visual e refinamentos, ~1 min para iteração de correções.

---

**Aprove o plano** para eu mudar para o modo de execução, capturar as telas e gerar o PDF.
