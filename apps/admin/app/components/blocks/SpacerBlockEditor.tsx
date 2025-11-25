"use client";

import { Minus } from "lucide-react";
import type { SpacerBlock } from "./types";

interface Props {
  block: SpacerBlock;
  onChange: (data: SpacerBlock['data']) => void;
}

const SIZES = [
  { value: 'small', label: 'Klein', height: 'h-4' },
  { value: 'medium', label: 'Medium', height: 'h-8' },
  { value: 'large', label: 'Groot', height: 'h-16' },
] as const;

export default function SpacerBlockEditor({ block, onChange }: Props) {
  const current = SIZES.find(s => s.value === block.data.size) || SIZES[1];

  return (
    <div className="flex items-center gap-3 py-2">
      <Minus className="w-4 h-4 text-zinc-300" />
      <div className={`flex-1 ${current.height} bg-zinc-100 rounded border-2 border-dashed border-zinc-200`} />
      <select
        value={block.data.size}
        onChange={e => onChange({ size: e.target.value as any })}
        className="text-sm border border-zinc-200 rounded px-2 py-1"
      >
        {SIZES.map(size => (
          <option key={size.value} value={size.value}>{size.label}</option>
        ))}
      </select>
    </div>
  );
}
