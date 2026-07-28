"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
  size?: "sm" | "md";
}

export function ShareButton({ title, url, className, size = "md" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    // Try Web Share API first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error, fall through to clipboard
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-accent/10",
        copied && "border-green-500/50 text-green-500",
        size === "sm" && "px-2 py-1 text-xs",
        className
      )}
      title={copied ? "Link copiato!" : "Condividi"}
    >
      {copied ? (
        <>
          <Check className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
          <span>Copiato!</span>
        </>
      ) : (
        <>
          <Share2 className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
          <span className="hidden sm:inline">Condividi</span>
        </>
      )}
    </button>
  );
}
