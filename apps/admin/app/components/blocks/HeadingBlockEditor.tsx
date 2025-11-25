"use client";

import type { HeadingBlock } from "./types";

interface Props {
  block: HeadingBlock;
  onChange: (data: HeadingBlock['data']) => void;
}

export default function HeadingBlockEditor({ block, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={block.data.level}
          onChange={e => onChange({ ...block.data, level: Number(e.target.value) as 1 | 2 | 3 })}
          className="text-sm border border-zinc-200 rounded px-2 py-1"
        >
          <option value={1}>H1 - Groot</option>
          <option value={2}>H2 - Medium</option>
          <option value={3}>H3 - Klein</option>
        </select>
      </div>
      <input
        type="text"
        value={block.data.text}
        onChange={e => onChange({ ...block.data, text: e.target.value })}
        placeholder="Koptekst..."
        className={`w-full border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral/30 ${
          block.data.level === 1 ? 'text-3xl font-bold' : block.data.level === 2 ? 'text-2xl font-semibold' : 'text-xl font-medium'
        }`}
      />
    </div>
  );
}
