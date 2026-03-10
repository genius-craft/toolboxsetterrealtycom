import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '5519971223648';
const DEFAULT_MESSAGE = 'Olá! Gostaria de falar com um especialista sobre minha análise imobiliária.';

export function WhatsAppButton() {
  const [visible, setVisible] = useState(true);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 group">
      <button
        onClick={() => setVisible(false)}
        className="absolute -top-2 -right-2 z-50 bg-muted hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors duration-200"
        aria-label="Fechar botão do WhatsApp"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com especialista no WhatsApp"
      >
        <div className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
          <MessageCircle className="h-6 w-6" />
          <span className="hidden sm:inline whitespace-nowrap font-medium">
            Falar com especialista
          </span>
        </div>
      </a>
    </div>
  );
}
