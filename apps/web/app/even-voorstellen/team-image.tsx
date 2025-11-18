"use client";

import { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface TeamImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function TeamImage({ src, alt, width = 128, height = 128, quality = 85, className = '', loading = 'lazy', priority = false }: TeamImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <User className="w-16 h-16 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      className={`w-full h-full object-cover ${className}`}
      onError={() => setError(true)}
      loading={loading}
      priority={priority}
    />
  );
}
