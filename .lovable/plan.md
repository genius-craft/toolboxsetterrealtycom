

# Plano: Adicionar botão de fechar no WhatsApp Button

## Problema
O botão flutuante "Falar com especialista" sobrepõe os botões de ação (Abrir Projeto, Exportar PDF) nas páginas de ferramentas.

## Solução
Adicionar um botão "X" para dismiss temporário do WhatsApp button. Usar `useState` para controlar visibilidade. O botão reaparece ao mudar de página (ou após recarregar).

## Mudanças
**`src/components/WhatsAppButton.tsx`**:
- Adicionar estado `visible` com `useState(true)`
- Quando `!visible`, não renderizar nada (ou renderizar apenas o ícone pequeno)
- Adicionar botão "X" no canto superior direito do componente
- Ao clicar no X, setar `visible = false`

