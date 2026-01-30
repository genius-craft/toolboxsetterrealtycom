import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '5519971223648';
const DEFAULT_MESSAGE = 'Olá! Gostaria de falar com um especialista sobre minha análise imobiliária.';

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 group"
      aria-label="Falar com especialista no WhatsApp"
    >
      <div className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
        <MessageCircle className="h-6 w-6" />
        <span className="hidden sm:inline whitespace-nowrap font-medium">
          Falar com especialista
        </span>
      </div>
    </a>
  );
}
