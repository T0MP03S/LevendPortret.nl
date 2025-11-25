"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, List, ListOrdered, Quote, Code, Undo, Redo, Link as LinkIcon, Image as ImageIcon, Eraser } from "lucide-react";

type Props = {
  value: any;
  onChange: (json: any) => void;
  placeholder?: string;
};

export default function ArticleEditor({ value, onChange, placeholder }: Props) {
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder || "Schrijf je artikel..." }),
    ],
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[260px] focus:outline-none",
      },
    },
    content: coerceContent(value),
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = coerceContent(value);
    const curr = editor.getJSON();
    try {
      if (JSON.stringify(curr) !== JSON.stringify(next)) {
        editor.commands.setContent(next, false);
      }
    } catch {}
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-zinc-300 rounded-xl bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 bg-zinc-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon className="w-4 h-4"/></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-300"/>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 className="w-4 h-4"/></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-300"/>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><Code className="w-4 h-4"/></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-300"/>
        <ToolbarButton onClick={() => { const prev = editor.getAttributes("link").href || ""; setLinkUrl(prev); setShowLink(true); }} active={editor.isActive("link")}><LinkIcon className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => { setImageUrl(""); setShowImage(true); }} active={false}><ImageIcon className="w-4 h-4"/></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-300"/>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false}><Undo className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false}><Redo className="w-4 h-4"/></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} active={false}><Eraser className="w-4 h-4"/></ToolbarButton>
      </div>
      {(showLink || showImage) && (
        <div className="px-3 py-2 border-b border-zinc-200 bg-white flex flex-wrap items-center gap-2">
          {showLink && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://" className="flex-1 min-w-[220px] border border-zinc-300 rounded-md px-3 py-2 text-sm" />
              <button type="button" className="px-3 py-2 rounded-md bg-coral text-white text-sm" onClick={()=>{ if (linkUrl) { editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run(); } setShowLink(false); }}>Toevoegen</button>
              <button type="button" className="px-3 py-2 rounded-md border border-zinc-300 text-sm" onClick={()=>{ editor.chain().focus().unsetLink().run(); setShowLink(false); }}>Verwijderen</button>
              <button type="button" className="px-3 py-2 rounded-md border border-zinc-300 text-sm" onClick={()=> setShowLink(false)}>Annuleren</button>
            </div>
          )}
          {showImage && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="Afbeelding URL" className="flex-1 min-w-[220px] border border-zinc-300 rounded-md px-3 py-2 text-sm" />
              <button type="button" className="px-3 py-2 rounded-md bg-coral text-white text-sm" onClick={()=>{ if (imageUrl) { editor.chain().focus().setImage({ src: imageUrl }).run(); } setShowImage(false); }}>Toevoegen</button>
              <button type="button" className="px-3 py-2 rounded-md border border-zinc-300 text-sm" onClick={()=> setShowImage(false)}>Annuleren</button>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function coerceContent(value: any) {
  if (!value) return { type: "doc", content: [{ type: "paragraph" }] };
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] }; }
  }
  return value;
}

function ToolbarButton({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center w-8 h-8 rounded-md border ${active ? 'bg-navy/10 border-navy/20 text-navy' : 'bg-white border-zinc-300 text-zinc-700'} hover:bg-zinc-50`}>
      {children}
    </button>
  );
}
