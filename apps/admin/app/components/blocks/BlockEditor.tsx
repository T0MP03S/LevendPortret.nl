"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { Plus, Type, Heading, ImageIcon, Quote, Video, Code, Minus, MousePointer2, GalleryHorizontal, ChevronDown } from "lucide-react";
import type { Block, BlockType } from "./types";
import { createBlock, BLOCK_LABELS } from "./types";
import SortableBlock from "./SortableBlock";

interface Props {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const BLOCK_OPTIONS: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: 'text', icon: <Type className="w-4 h-4" />, label: 'Tekst' },
  { type: 'heading', icon: <Heading className="w-4 h-4" />, label: 'Kop' },
  { type: 'image', icon: <ImageIcon className="w-4 h-4" />, label: 'Afbeelding' },
  { type: 'quote', icon: <Quote className="w-4 h-4" />, label: 'Quote' },
  { type: 'video', icon: <Video className="w-4 h-4" />, label: 'Video' },
  { type: 'code', icon: <Code className="w-4 h-4" />, label: 'Code' },
  { type: 'spacer', icon: <Minus className="w-4 h-4" />, label: 'Witruimte' },
  { type: 'cta', icon: <MousePointer2 className="w-4 h-4" />, label: 'Call-to-Action' },
  { type: 'gallery', icon: <GalleryHorizontal className="w-4 h-4" />, label: 'Galerij' },
  { type: 'accordion', icon: <ChevronDown className="w-4 h-4" />, label: 'Accordion' },
];

export default function BlockEditor({ blocks, onChange }: Props) {
  const [showAddMenu, setShowAddMenu] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: BlockType, afterIndex: number) => {
    const newBlock = createBlock(type, nanoid(10));
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    onChange(newBlocks);
    setShowAddMenu(null);
  };

  const updateBlock = (id: string, newData: Block['data']) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data: newData } as Block : b));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    const original = blocks[index];
    const copy: Block = { ...original, id: nanoid(10) } as Block;
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, copy);
    onChange(newBlocks);
  };

  return (
    <div className="space-y-2">
      {/* Add block at start */}
      <AddBlockButton
        isOpen={showAddMenu === -1}
        onToggle={() => setShowAddMenu(showAddMenu === -1 ? null : -1)}
        onAdd={(type) => addBlock(type, -1)}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <div key={block.id}>
              <SortableBlock
                block={block}
                onUpdate={(data: Block['data']) => updateBlock(block.id, data)}
                onDelete={() => deleteBlock(block.id)}
                onDuplicate={() => duplicateBlock(block.id)}
              />
              <AddBlockButton
                isOpen={showAddMenu === index}
                onToggle={() => setShowAddMenu(showAddMenu === index ? null : index)}
                onAdd={(type) => addBlock(type, index)}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="mb-4">Nog geen blokken. Voeg je eerste blok toe!</p>
        </div>
      )}
    </div>
  );
}

interface AddBlockButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  onAdd: (type: BlockType) => void;
}

function AddBlockButton({ isOpen, onToggle, onAdd }: AddBlockButtonProps) {
  return (
    <div className="relative py-2">
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
            isOpen ? 'bg-coral text-white border-coral' : 'bg-white text-zinc-500 border-zinc-200 hover:border-coral hover:text-coral'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Blok toevoegen</span>
        </button>
      </div>
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-10 bg-white rounded-xl shadow-lg border border-zinc-200 p-2 flex flex-wrap gap-1 min-w-[320px]">
          {BLOCK_OPTIONS.map(opt => (
            <button
              key={opt.type}
              type="button"
              onClick={() => onAdd(opt.type)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 text-sm text-zinc-700 w-[calc(50%-2px)]"
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
