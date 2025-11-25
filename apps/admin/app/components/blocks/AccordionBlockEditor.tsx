"use client";

import { ChevronDown, Plus, Trash2, GripVertical } from "lucide-react";
import type { AccordionBlock } from "./types";

interface Props {
  block: AccordionBlock;
  onChange: (data: AccordionBlock["data"]) => void;
}

export default function AccordionBlockEditor({ block, onChange }: Props) {
  const { items } = block.data;

  const addItem = () => {
    onChange({
      items: [...items, { title: "", content: "" }],
    });
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange({
      items: items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: "title" | "content", value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <ChevronDown className="w-4 h-4" />
          <span>Accordion ({items.length} items)</span>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 text-sm text-coral hover:text-coral/80"
        >
          <Plus className="w-4 h-4" />
          Item toevoegen
        </button>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-zinc-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 bg-zinc-50 px-3 py-2">
              <GripVertical className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(i, "title", e.target.value)}
                placeholder="Vraag of titel..."
                className="flex-1 text-sm font-medium bg-transparent border-0 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length <= 1}
                className="p-1 text-zinc-400 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {/* Content */}
            <div className="px-3 py-2">
              <textarea
                value={item.content}
                onChange={(e) => updateItem(i, "content", e.target.value)}
                placeholder="Antwoord of inhoud..."
                rows={3}
                className="w-full text-sm border border-zinc-200 rounded px-3 py-2 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="border-t border-zinc-200 pt-4">
        <p className="text-xs text-zinc-500 mb-2">Preview:</p>
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          {items.map((item, i) => (
            <div key={i} className="border-b border-zinc-200 last:border-b-0">
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 cursor-pointer hover:bg-zinc-100">
                <span className="font-medium text-sm">{item.title || "Titel..."}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </div>
              {i === 0 && (
                <div className="px-4 py-3 text-sm text-zinc-600">
                  {item.content || "Inhoud..."}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
