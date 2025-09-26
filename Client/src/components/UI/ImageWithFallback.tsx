"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
}

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  width,
  height,
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (imageError || !src) {
    return (
      <div
        className={`image-placeholder flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${fallbackClassName} ${className}`}
        style={{ width, height }}
      >
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div
          className={`image-placeholder animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        alt={alt}
        className={`${className} ${imageLoaded ? "block" : "hidden"}`}
        src={src}
        style={{ width, height }}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
      />
    </>
  );
}
