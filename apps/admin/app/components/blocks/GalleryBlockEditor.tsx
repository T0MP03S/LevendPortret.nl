"use client";

import { useState } from "react";
import { GalleryHorizontal, Plus, X, Loader2 } from "lucide-react";
import type { GalleryBlock } from "./types";
import { deleteFromR2 } from "./utils";

interface Props {
  block: GalleryBlock;
  onChange: (data: GalleryBlock["data"]) => void;
}

export default function GalleryBlockEditor({ block, onChange }: Props) {
  const { images, layout, columns } = block.data;
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload mislukt");

      onChange({
        ...block.data,
        images: [...images, { url: data.publicUrl, alt: "", caption: "" }],
      });
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove?.url) {
      await deleteFromR2(imageToRemove.url);
    }
    onChange({
      ...block.data,
      images: images.filter((_, i) => i !== index),
    });
  };

  const updateImage = (index: number, field: "alt" | "caption", value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ ...block.data, images: newImages });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
        <GalleryHorizontal className="w-4 h-4" />
        <span>Galerij ({images.length} afbeeldingen)</span>
      </div>

      {/* Settings */}
      <div className="flex gap-4 text-sm">
        <div>
          <label className="block text-zinc-600 mb-1">Layout</label>
          <div className="flex gap-1">
            {(["grid", "carousel"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onChange({ ...block.data, layout: l })}
                className={`px-3 py-1 rounded border ${
                  layout === l ? "border-coral bg-coral/10 text-coral" : "border-zinc-200"
                }`}
              >
                {l === "grid" ? "Grid" : "Carousel"}
              </button>
            ))}
          </div>
        </div>
        {layout === "grid" && (
          <div>
            <label className="block text-zinc-600 mb-1">Kolommen</label>
            <div className="flex gap-1">
              {([2, 3, 4] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ ...block.data, columns: c })}
                  className={`px-3 py-1 rounded border ${
                    columns === c ? "border-coral bg-coral/10 text-coral" : "border-zinc-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Images grid */}
      <div className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {images.map((img, i) => (
          <div key={i} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt || ""}
              className="w-full aspect-square object-cover rounded-lg border border-zinc-200"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-zinc-600" />
            </button>
            <input
              type="text"
              value={img.caption || ""}
              onChange={(e) => updateImage(i, "caption", e.target.value)}
              placeholder="Caption..."
              className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}

        {/* Add button */}
        <label
          className={`aspect-square border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-coral/50 transition-colors ${
            uploading ? "pointer-events-none" : ""
          }`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-coral animate-spin" />
          ) : (
            <>
              <Plus className="w-6 h-6 text-zinc-400" />
              <span className="text-xs text-zinc-500 mt-1">Toevoegen</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
