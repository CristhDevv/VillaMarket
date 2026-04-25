"use client";

import { useState } from "react";
import { ShareNetwork, Check } from "@phosphor-icons/react";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        console.error("Error al compartir", err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Error al copiar", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-pill text-xs font-bold text-foreground hover:bg-border transition-colors"
    >
      {copied ? (
        <>
          <Check size={16} className="text-green-600" />
          <span className="text-green-600">¡Copiado!</span>
        </>
      ) : (
        <>
          <ShareNetwork size={16} className="text-accent" />
          <span>Compartir</span>
        </>
      )}
    </button>
  );
}
