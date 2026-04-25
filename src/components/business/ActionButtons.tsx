"use client";

import { WhatsappLogo, Phone, ShareNetwork } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  phone?: string | null;
  whatsapp?: string | null;
  name: string;
}

export function ActionButtons({ phone, whatsapp, name }: ActionButtonsProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `Mira este negocio en VillaMarket: ${name}`,
          url: window.location.href,
        });
      } else {
        alert("Tu navegador no soporta compartir");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-green-50 text-green-600 py-3 rounded-card border border-green-200 active:scale-95 transition-all"
        >
          <WhatsappLogo size={24} weight="fill" />
          <span className="text-xs font-medium">WhatsApp</span>
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-surface text-foreground py-3 rounded-card border border-border active:scale-95 transition-all"
        >
          <Phone size={24} weight="fill" />
          <span className="text-xs font-medium">Llamar</span>
        </a>
      )}
      <button
        onClick={handleShare}
        className="flex-1 flex flex-col items-center justify-center gap-1 bg-surface text-foreground py-3 rounded-card border border-border active:scale-95 transition-all"
      >
        <ShareNetwork size={24} weight="fill" />
        <span className="text-xs font-medium">Compartir</span>
      </button>
    </div>
  );
}
