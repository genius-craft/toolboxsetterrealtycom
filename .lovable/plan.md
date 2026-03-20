

# Plano: Adicionar telefone da Setter no rodapé do PDF

## Mudança

**Arquivo:** `src/lib/pdfExport.ts` (linhas 154-167)

Adicionar o telefone de contato `(19) 97122-3648` no rodapé de todos os PDFs exportados, entre o disclaimer e o "Gerado por Setter Toolbox".

### Layout do rodapé atualizado

```text
─────────────────────────────────────────────────────────
Este relatório é para fins informativos...
Contato: (19) 97122-3648 | setter.realty                    Gerado por Setter Toolbox
```

### Detalhes técnicos

- Adicionar uma segunda linha no footer com o telefone formatado
- Ajustar `footerY` para acomodar 2 linhas (mover de `pageHeight - 15` para `pageHeight - 20`)
- Linha 1: disclaimer (já existe)
- Linha 2: telefone + site à esquerda, "Gerado por Setter Toolbox" à direita

