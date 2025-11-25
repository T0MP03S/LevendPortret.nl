"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { TextBlock } from "./types";

interface Props {
  block: TextBlock;
  onChange: (data: TextBlock['data']) => void;
}

export default function TextBlockEditor({ block, onChange }: Props) {
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Schrijf hier..." }),
    ],
    editorProps: {
      attributes: { class: "prose prose-sm max-w-none min-h-[80px] focus:outline-none" },
    },
    content: block.data.content,
    immediatelyRender: false,
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange({ content: editor.getJSON() });
    },
  });

  useEffect(() => {
    if (!editor) return;
    const curr = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(block.data.content);
    if (curr !== next) {
      editor.commands.setContent(block.data.content, false);
    }
  }, [block.data.content, editor]);

  if (!editor) return null;

  return (
    <div className="border border-zinc-200 rounded-lg bg-white">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-zinc-100 bg-zinc-50/50">
        <MiniBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="w-3.5 h-3.5" /></MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="w-3.5 h-3.5" /></MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon className="w-3.5 h-3.5" /></MiniBtn>
        <span className="mx-1 h-4 w-px bg-zinc-200" />
        <MiniBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="w-3.5 h-3.5" /></MiniBtn>
        <MiniBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="w-3.5 h-3.5" /></MiniBtn>
        <span className="mx-1 h-4 w-px bg-zinc-200" />
        <MiniBtn onClick={() => { setLinkUrl(editor.getAttributes("link").href || ""); setShowLink(true); }} active={editor.isActive("link")}><LinkIcon className="w-3.5 h-3.5" /></MiniBtn>
      </div>
      {showLink && (
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-zinc-100 bg-white">
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://" className="flex-1 text-sm border border-zinc-200 rounded px-2 py-1" />
          <button type="button" className="text-xs px-2 py-1 bg-coral text-white rounded" onClick={() => { if (linkUrl) editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run(); setShowLink(false); }}>OK</button>
          <button type="button" className="text-xs px-2 py-1 border border-zinc-200 rounded" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLink(false); }}>Verwijder</button>
          <button type="button" className="text-xs px-2 py-1 text-zinc-500" onClick={() => setShowLink(false)}>×</button>
        </div>
      )}
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function MiniBtn({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`p-1.5 rounded ${active ? 'bg-navy/10 text-navy' : 'text-zinc-600 hover:bg-zinc-100'}`}>
      {children}
    </button>
  );
}
