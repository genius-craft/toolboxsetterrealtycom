# 3 Ajustes Finais Pré-Lançamento

## Resumo

Plugar IA no PDF (bloqueante), polimento do `resetKey` (já feito ✅) e mensagem amigável para 503 do gateway. Sem mudanças de banco.

---

## 1. Plugar `PDFExportWithAIButton` nas 5 calculadoras (BLOQUEANTE)

**Refatorar o componente** `src/components/ai/PDFExportWithAIButton.tsx`:
- Aceitar props `variant`, `size`, `label`, `iconOnly`, `className` para se adaptar aos diferentes botões existentes (cada calculadora usa estilo próprio: `gold`, `outline`, com classes específicas como o laranja `#E85D3D` do Simulador).
- Manter o dropdown com 2 opções: "PDF padrão" e "PDF + Resumo IA" (✨).
- No fallback: se a IA falhar, mostra toast e ainda gera o PDF sem resumo (já implementado).

**Ajustar `handleExportPDF` em cada página** para receber `aiSummary?: string` e passá-lo ao `generate*PDF`:

```ts
const handleExportPDF = async (aiSummary?: string) => {
  setIsExportingPDF(true);
  try {
    await generateSimuladorPDF({
      // ... campos existentes
      aiSummary, // <- novo
    });
    toast.success('PDF gerado com sucesso!');
  } catch { ... } finally { setIsExportingPDF(false); }
};
```

**Trocar o `<Button onClick={handleExportPDF}>` pelo componente** em:

| Arquivo | Linha aprox. | Estilo a preservar |
|---|---|---|
| `src/pages/Simulador.tsx` | 591–602 | `bg-[#E85D3D]` laranja, `w-full`, ícone FileText |
| `src/pages/Permuta.tsx` | 349–352 | `outline sm` |
| `src/pages/HighestBestUse.tsx` | 330–336 | `outline icon-only` |
| `src/pages/Decisor.tsx` | 495–507 | `outline flex-1` |
| `src/pages/PrecoTeto.tsx` | 498–512 | `gold flex-1` (dentro do `SoftLockOverlay`) |

Preservo `disabled={!user || isExportingPDF}` e wrappers (`SoftLockOverlay`).

---

## 2. `resetKey` no AIAnalysisCard ✅ JÁ FEITO

Após inspeção, todas as 5 páginas (Simulador L523, Permuta L376, HBU L315, Decisor L480, PrecoTeto L470) **já passam `resetKey`** com hash dos inputs/resultados relevantes. Sem ação necessária.

---

## 3. Mensagem amigável para 503 do AI Gateway

**Editar `supabase/functions/_shared/ai-helpers.ts`** na função `callLovableAI`:

Hoje, qualquer status fora 429/402 cai num erro genérico "Erro no provedor de IA." Adicionar tratamento para 503/504:

```ts
if (resp.status === 503 || resp.status === 504) {
  return {
    ok: false,
    response: jsonResponse(
      { error: "O serviço de IA está sobrecarregado. Aguarde alguns segundos e tente novamente." },
      503,
    ),
  };
}
```

Isso garante que o toast no front mostre uma mensagem clara e acionável quando o gateway tem flutuação transitória (que é normal).

---

## Validação pós-implementação

1. `npx tsc --noEmit` para garantir typecheck limpo.
2. Deploy das edge functions (`supabase--deploy_edge_functions` para `tool-analyze`, `tool-pdf-summary`, `tool-vitrine-copy`, `tool-compare`, `tool-autofill` — todas usam o helper alterado).
3. Smoke test: invocar uma vez `tool-pdf-summary` para confirmar 200 OK.

Estimativa: ~15 min de implementação. Sem riscos colaterais — todas as mudanças são aditivas (novo botão substituindo o antigo, novo branch de status code).

Aprovando, eu já entrego.
