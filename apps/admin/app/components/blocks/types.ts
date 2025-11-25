// Block types for the article editor

export type BlockType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'quote'
  | 'video'
  | 'code'
  | 'spacer'
  | 'cta'
  | 'gallery'
  | 'accordion';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  data: {
    content: any; // Tiptap JSON
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  data: {
    level: 1 | 2 | 3;
    text: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  data: {
    url: string;
    alt?: string;
    caption?: string;
    width?: 'full' | 'wide' | 'normal';
  };
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  data: {
    text: string;
    author?: string;
  };
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  data: {
    url: string; // YouTube or Vimeo URL
    caption?: string;
  };
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  data: {
    code: string;
    language?: string;
  };
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  data: {
    size: 'small' | 'medium' | 'large';
  };
}

export interface CtaBlock extends BaseBlock {
  type: 'cta';
  data: {
    title: string;
    description?: string;
    buttonText: string;
    buttonUrl: string;
    style: 'primary' | 'secondary' | 'outline';
  };
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  data: {
    images: Array<{
      url: string;
      alt?: string;
      caption?: string;
    }>;
    layout: 'grid' | 'carousel';
    columns: 2 | 3 | 4;
  };
}

export interface AccordionBlock extends BaseBlock {
  type: 'accordion';
  data: {
    items: Array<{
      title: string;
      content: string;
    }>;
  };
}

export type Block = 
  | TextBlock 
  | HeadingBlock 
  | ImageBlock 
  | QuoteBlock 
  | VideoBlock 
  | CodeBlock 
  | SpacerBlock
  | CtaBlock
  | GalleryBlock
  | AccordionBlock;

export function createBlock(type: BlockType, id: string): Block {
  switch (type) {
    case 'text':
      return { id, type: 'text', data: { content: { type: 'doc', content: [{ type: 'paragraph' }] } } };
    case 'heading':
      return { id, type: 'heading', data: { level: 2, text: '' } };
    case 'image':
      return { id, type: 'image', data: { url: '', width: 'normal' } };
    case 'quote':
      return { id, type: 'quote', data: { text: '' } };
    case 'video':
      return { id, type: 'video', data: { url: '' } };
    case 'code':
      return { id, type: 'code', data: { code: '', language: 'javascript' } };
    case 'spacer':
      return { id, type: 'spacer', data: { size: 'medium' } };
    case 'cta':
      return { id, type: 'cta', data: { title: '', buttonText: 'Lees meer', buttonUrl: '', style: 'primary' } };
    case 'gallery':
      return { id, type: 'gallery', data: { images: [], layout: 'grid', columns: 3 } };
    case 'accordion':
      return { id, type: 'accordion', data: { items: [{ title: '', content: '' }] } };
  }
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  text: 'Tekst',
  heading: 'Kop',
  image: 'Afbeelding',
  quote: 'Quote',
  video: 'Video',
  code: 'Code',
  spacer: 'Witruimte',
  cta: 'Call-to-Action',
  gallery: 'Galerij',
  accordion: 'Accordion',
};
