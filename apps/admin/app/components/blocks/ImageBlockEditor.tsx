"use client";

import { useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import type { ImageBlock } from "./types";
import { deleteFromR2 } from "./utils";

interface Props {
  block: ImageBlock;
  onChange: (data: ImageBlock['data']) => void;
}

export default function ImageBlockEditor({ block, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Alleen afbeeldingen toegestaan");
      return;
    }
    setUploading(true);
    setError("");
    try {
      // Get presigned URL
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload mislukt");

      // Upload to R2
      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload naar storage mislukt");

      onChange({ ...block.data, url: data.publicUrl });
    } catch (e: any) {
      setError(e?.message || "Upload mislukt");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-3">
      {block.data.url ? (
        <div className="relative group">
          <img src={block.data.url} alt={block.data.alt || ""} className="w-full rounded-lg border border-zinc-200" />
          <button
            type="button"
            onClick={async () => {
              await deleteFromR2(block.data.url);
              onChange({ ...block.data, url: "" });
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center hover:border-coral/50 transition-colors"
        >
          <ImageIcon className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
          <p className="text-zinc-600 mb-3">Sleep een afbeelding hierheen of</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-coral text-white rounded-lg cursor-pointer hover:bg-coral/90">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploaden..." : "Kies bestand"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
              disabled={uploading}
            />
          </label>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      )}

      {block.data.url && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Alt tekst</label>
            <input
              type="text"
              value={block.data.alt || ""}
              onChange={e => onChange({ ...block.data, alt: e.target.value })}
              placeholder="Beschrijving..."
              className="w-full text-sm border border-zinc-200 rounded px-2 py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Breedte</label>
            <select
              value={block.data.width || "normal"}
              onChange={e => onChange({ ...block.data, width: e.target.value as any })}
              className="w-full text-sm border border-zinc-200 rounded px-2 py-1.5"
            >
              <option value="normal">Normaal</option>
              <option value="wide">Breed</option>
              <option value="full">Volledig</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-zinc-500 mb-1">Bijschrift</label>
            <input
              type="text"
              value={block.data.caption || ""}
              onChange={e => onChange({ ...block.data, caption: e.target.value })}
              placeholder="Optioneel bijschrift..."
              className="w-full text-sm border border-zinc-200 rounded px-2 py-1.5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
