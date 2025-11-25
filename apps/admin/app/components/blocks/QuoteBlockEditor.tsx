"use client";

import { Quote } from "lucide-react";
import type { QuoteBlock } from "./types";

interface Props {
  block: QuoteBlock;
  onChange: (data: QuoteBlock['data']) => void;
}

export default function QuoteBlockEditor({ block, onChange }: Props) {
  return (
    <div className="relative pl-4 border-l-4 border-coral/50">
      <Quote className="absolute -left-3 -top-1 w-6 h-6 text-coral/30 bg-white" />
      <textarea
        value={block.data.text}
        onChange={e => onChange({ ...block.data, text: e.target.value })}
        placeholder="Citaat tekst..."
        rows={3}
        className="w-full text-lg italic text-zinc-700 border-0 bg-transparent resize-none focus:outline-none focus:ring-0"
      />
      <input
        type="text"
        value={block.data.author || ""}
        onChange={e => onChange({ ...block.data, author: e.target.value })}
        placeholder="— Auteur (optioneel)"
        className="w-full text-sm text-zinc-500 border-0 bg-transparent focus:outline-none focus:ring-0"
      />
    </div>
  );
}
