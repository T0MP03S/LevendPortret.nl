"use client";

import { Video, ExternalLink } from "lucide-react";
import type { VideoBlock } from "./types";

interface Props {
  block: VideoBlock;
  onChange: (data: VideoBlock['data']) => void;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  
  return null;
}

export default function VideoBlockEditor({ block, onChange }: Props) {
  const embedUrl = getEmbedUrl(block.data.url);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={block.data.url}
          onChange={e => onChange({ ...block.data, url: e.target.value })}
          placeholder="YouTube of Vimeo URL..."
          className="flex-1 text-sm border border-zinc-200 rounded px-3 py-2"
        />
        {block.data.url && (
          <a href={block.data.url} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-zinc-600">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {embedUrl ? (
        <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : block.data.url ? (
        <div className="aspect-video rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
          <p>Ongeldige video URL. Gebruik YouTube of Vimeo.</p>
        </div>
      ) : (
        <div className="aspect-video rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
          <div className="text-center">
            <Video className="w-12 h-12 mx-auto mb-2" />
            <p>Plak een YouTube of Vimeo URL</p>
          </div>
        </div>
      )}

      <input
        type="text"
        value={block.data.caption || ""}
        onChange={e => onChange({ ...block.data, caption: e.target.value })}
        placeholder="Bijschrift (optioneel)..."
        className="w-full text-sm border border-zinc-200 rounded px-3 py-2"
      />
    </div>
  );
}
