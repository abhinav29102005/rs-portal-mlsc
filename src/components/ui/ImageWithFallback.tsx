"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackText: string;
}

export function ImageWithFallback({ src, fallbackText, alt, className, ...rest }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-noir-800 ${className || ""}`}>
        <span className="text-xl font-bold text-red-400" style={{ fontFamily: "var(--font-heading)" }}>
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || fallbackText}
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
}
