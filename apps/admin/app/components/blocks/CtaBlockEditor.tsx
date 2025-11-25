"use client";

import { MousePointer2 } from "lucide-react";
import type { CtaBlock } from "./types";

interface Props {
  block: CtaBlock;
  onChange: (data: CtaBlock["data"]) => void;
}

export default function CtaBlockEditor({ block, onChange }: Props) {
  const { title, description, buttonText, buttonUrl, style } = block.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
        <MousePointer2 className="w-4 h-4" />
        <span>Call-to-Action</span>
      </div>

      {/* Preview */}
      <div
        className={`p-6 rounded-xl text-center ${
          style === "primary"
            ? "bg-coral text-white"
            : style === "secondary"
            ? "bg-navy text-white"
            : "bg-white border-2 border-coral"
        }`}
      >
        <h3 className={`text-xl font-bold mb-2 ${style === "outline" ? "text-navy" : ""}`}>
          {title || "Titel hier..."}
        </h3>
        {description && (
          <p className={`mb-4 ${style === "outline" ? "text-zinc-600" : "opacity-90"}`}>
            {description}
          </p>
        )}
        <span
          className={`inline-block px-6 py-2.5 rounded-lg font-medium ${
            style === "primary"
              ? "bg-white text-coral"
              : style === "secondary"
              ? "bg-coral text-white"
              : "bg-coral text-white"
          }`}
        >
          {buttonText || "Knop tekst"}
        </span>
      </div>

      {/* Settings */}
      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Titel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ ...block.data, title: e.target.value })}
            placeholder="Bijv: Meld je nu aan!"
            className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Beschrijving (optioneel)</label>
          <textarea
            value={description || ""}
            onChange={(e) => onChange({ ...block.data, description: e.target.value })}
            placeholder="Extra tekst onder de titel..."
            rows={2}
            className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Knop tekst</label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => onChange({ ...block.data, buttonText: e.target.value })}
              placeholder="Lees meer"
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Knop URL</label>
            <input
              type="text"
              value={buttonUrl}
              onChange={(e) => onChange({ ...block.data, buttonUrl: e.target.value })}
              placeholder="https://..."
              className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Stijl</label>
          <div className="flex gap-2">
            {(["primary", "secondary", "outline"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...block.data, style: s })}
                className={`px-3 py-1.5 text-sm rounded-lg border ${
                  style === s
                    ? "border-coral bg-coral/10 text-coral"
                    : "border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {s === "primary" ? "Coral" : s === "secondary" ? "Navy" : "Outline"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
