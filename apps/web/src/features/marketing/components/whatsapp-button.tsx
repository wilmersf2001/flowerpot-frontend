import { MessageCircle } from "lucide-react";
import type { WhatsAppSupport } from "../lib/site-settings.api";

/** Botón flotante de soporte por WhatsApp (solo si el admin lo activó). */
export function WhatsAppButton({ support }: { support: WhatsAppSupport }) {
  const href = `https://wa.me/${support.phone}${
    support.message ? `?text=${encodeURIComponent(support.message)}` : ""
  }`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
