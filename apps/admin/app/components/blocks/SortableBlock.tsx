"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Copy } from "lucide-react";
import type { Block } from "./types";
import { BLOCK_LABELS } from "./types";
import TextBlockEditor from "./TextBlockEditor";
import HeadingBlockEditor from "./HeadingBlockEditor";
import ImageBlockEditor from "./ImageBlockEditor";
import QuoteBlockEditor from "./QuoteBlockEditor";
import VideoBlockEditor from "./VideoBlockEditor";
import CodeBlockEditor from "./CodeBlockEditor";
import SpacerBlockEditor from "./SpacerBlockEditor";
import CtaBlockEditor from "./CtaBlockEditor";
import GalleryBlockEditor from "./GalleryBlockEditor";
import AccordionBlockEditor from "./AccordionBlockEditor";

interface Props {
  block: Block;
  onUpdate: (data: Block['data']) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function SortableBlock({ block, onUpdate, onDelete, onDuplicate }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border ${isDragging ? 'border-coral shadow-lg' : 'border-zinc-200'} transition-shadow hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50 rounded-t-xl">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {BLOCK_LABELS[block.type]}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onDuplicate}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Dupliceren"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Verwijderen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {block.type === 'text' && <TextBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'heading' && <HeadingBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'image' && <ImageBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'quote' && <QuoteBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'video' && <VideoBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'code' && <CodeBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'spacer' && <SpacerBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'cta' && <CtaBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'gallery' && <GalleryBlockEditor block={block} onChange={onUpdate} />}
        {block.type === 'accordion' && <AccordionBlockEditor block={block} onChange={onUpdate} />}
      </div>
    </div>
  );
}
