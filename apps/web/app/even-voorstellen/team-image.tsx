"use client";

import { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface TeamImageProps {
  src: string;
  alt: string;
}

export function TeamImage({ src, alt }: TeamImageProps) {
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
      width={128}
      height={128}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}
