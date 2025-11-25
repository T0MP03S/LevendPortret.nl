"use client";

type Block = {
  id: string;
  type: string;
  data: any;
};

interface Props {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: Props) {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <TextBlockView content={block.data.content} />;
    case 'heading':
      return <HeadingBlockView level={block.data.level} text={block.data.text} />;
    case 'image':
      return <ImageBlockView url={block.data.url} alt={block.data.alt} caption={block.data.caption} width={block.data.width} />;
    case 'quote':
      return <QuoteBlockView text={block.data.text} author={block.data.author} />;
    case 'video':
      return <VideoBlockView url={block.data.url} caption={block.data.caption} />;
    case 'code':
      return <CodeBlockView code={block.data.code} language={block.data.language} />;
    case 'spacer':
      return <SpacerBlockView size={block.data.size} />;
    case 'cta':
      return <CtaBlockView {...block.data} />;
    case 'gallery':
      return <GalleryBlockView {...block.data} />;
    case 'accordion':
      return <AccordionBlockView items={block.data.items} />;
    default:
      return null;
  }
}

// Text block - render Tiptap JSON
function TextBlockView({ content }: { content: any }) {
  if (!content) return null;
  return (
    <div className="prose prose-zinc max-w-none">
      <TiptapContent content={content} />
    </div>
  );
}

// Simple Tiptap JSON to HTML renderer
function TiptapContent({ content }: { content: any }) {
  if (!content || !content.content) return null;
  
  return (
    <>
      {content.content.map((node: any, i: number) => (
        <TiptapNode key={i} node={node} />
      ))}
    </>
  );
}

function TiptapNode({ node }: { node: any }) {
  if (!node) return null;

  switch (node.type) {
    case 'paragraph':
      return <p>{node.content?.map((c: any, i: number) => <TiptapInline key={i} node={c} />)}</p>;
    case 'bulletList':
      return <ul>{node.content?.map((c: any, i: number) => <TiptapNode key={i} node={c} />)}</ul>;
    case 'orderedList':
      return <ol>{node.content?.map((c: any, i: number) => <TiptapNode key={i} node={c} />)}</ol>;
    case 'listItem':
      return <li>{node.content?.map((c: any, i: number) => <TiptapNode key={i} node={c} />)}</li>;
    default:
      return null;
  }
}

function TiptapInline({ node }: { node: any }) {
  if (!node) return null;
  
  if (node.type === 'text') {
    let text: React.ReactNode = node.text;
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'bold') text = <strong>{text}</strong>;
        if (mark.type === 'italic') text = <em>{text}</em>;
        if (mark.type === 'underline') text = <u>{text}</u>;
        if (mark.type === 'link') text = <a href={mark.attrs?.href} className="text-coral hover:underline">{text}</a>;
      }
    }
    return <>{text}</>;
  }
  return null;
}

// Heading block
function HeadingBlockView({ level, text }: { level: number; text: string }) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const classes = level === 1 ? 'text-3xl font-bold text-navy' : level === 2 ? 'text-2xl font-semibold text-navy' : 'text-xl font-medium text-navy';
  return <Tag className={classes}>{text}</Tag>;
}

// Image block
function ImageBlockView({ url, alt, caption, width }: { url: string; alt?: string; caption?: string; width?: string }) {
  if (!url) return null;
  const widthClass = width === 'full' ? 'w-full' : width === 'wide' ? 'w-full max-w-4xl mx-auto' : 'w-full max-w-2xl mx-auto';
  return (
    <figure className={widthClass}>
      <img src={url} alt={alt || ''} className="w-full rounded-lg" />
      {caption && <figcaption className="text-sm text-zinc-500 mt-2 text-center">{caption}</figcaption>}
    </figure>
  );
}

// Quote block
function QuoteBlockView({ text, author }: { text: string; author?: string }) {
  return (
    <blockquote className="border-l-4 border-coral/50 pl-4 py-2">
      <p className="text-lg italic text-zinc-700">{text}</p>
      {author && <cite className="text-sm text-zinc-500 not-italic">— {author}</cite>}
    </blockquote>
  );
}

// Video block
function VideoBlockView({ url, caption }: { url: string; caption?: string }) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;
  
  return (
    <figure>
      <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && <figcaption className="text-sm text-zinc-500 mt-2 text-center">{caption}</figcaption>}
    </figure>
  );
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

// Code block
function CodeBlockView({ code, language }: { code: string; language?: string }) {
  return (
    <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 overflow-x-auto">
      <code className={`language-${language || 'plaintext'}`}>{code}</code>
    </pre>
  );
}

// Spacer block
function SpacerBlockView({ size }: { size: string }) {
  const heights: Record<string, string> = { small: 'h-4', medium: 'h-8', large: 'h-16' };
  return <div className={heights[size] || 'h-8'} />;
}

// CTA block
function CtaBlockView({ title, description, buttonText, buttonUrl, style }: {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  style: 'primary' | 'secondary' | 'outline';
}) {
  return (
    <div
      className={`p-6 md:p-8 rounded-xl text-center ${
        style === 'primary'
          ? 'bg-coral text-white'
          : style === 'secondary'
          ? 'bg-navy text-white'
          : 'bg-white border-2 border-coral'
      }`}
    >
      <h3 className={`text-xl md:text-2xl font-bold mb-2 ${style === 'outline' ? 'text-navy' : ''}`}>
        {title}
      </h3>
      {description && (
        <p className={`mb-4 ${style === 'outline' ? 'text-zinc-600' : 'opacity-90'}`}>
          {description}
        </p>
      )}
      <a
        href={buttonUrl}
        className={`inline-block px-6 py-2.5 rounded-lg font-medium transition-colors ${
          style === 'primary'
            ? 'bg-white text-coral hover:bg-zinc-100'
            : style === 'secondary'
            ? 'bg-coral text-white hover:bg-coral/90'
            : 'bg-coral text-white hover:bg-coral/90'
        }`}
      >
        {buttonText}
      </a>
    </div>
  );
}

// Gallery block
function GalleryBlockView({ images, layout, columns }: {
  images: Array<{ url: string; alt?: string; caption?: string }>;
  layout: 'grid' | 'carousel';
  columns: 2 | 3 | 4;
}) {
  if (!images || images.length === 0) return null;

  const gridCols = columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {images.map((img, i) => (
        <figure key={i} className="group">
          <div className="aspect-square overflow-hidden rounded-lg bg-zinc-100">
            <img
              src={img.url}
              alt={img.alt || ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {img.caption && (
            <figcaption className="text-xs text-zinc-500 mt-1 text-center">{img.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// Accordion block
function AccordionBlockView({ items }: { items: Array<{ title: string; content: string }> }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden divide-y divide-zinc-200">
      {items.map((item, i) => (
        <details key={i} className="group">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
            <span className="font-medium">{item.title}</span>
            <svg
              className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 py-3 text-zinc-600">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
