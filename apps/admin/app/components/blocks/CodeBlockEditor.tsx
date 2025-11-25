"use client";

import { Code } from "lucide-react";
import type { CodeBlock } from "./types";

interface Props {
  block: CodeBlock;
  onChange: (data: CodeBlock['data']) => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'plaintext', label: 'Plain text' },
];

export default function CodeBlockEditor({ block, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Code className="w-4 h-4 text-zinc-400" />
        <select
          value={block.data.language || 'javascript'}
          onChange={e => onChange({ ...block.data, language: e.target.value })}
          className="text-sm border border-zinc-200 rounded px-2 py-1"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>
      <textarea
        value={block.data.code}
        onChange={e => onChange({ ...block.data, code: e.target.value })}
        placeholder="// Code hier..."
        rows={8}
        className="w-full font-mono text-sm bg-zinc-900 text-zinc-100 rounded-lg px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-coral/30"
        spellCheck={false}
      />
    </div>
  );
}
