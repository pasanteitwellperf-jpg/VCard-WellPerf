"use client";

import React from "react";

interface ProfileImageProps {
  src: string;
  alt: string;
  fallbackName: string;
  className?: string;
}

export default function ProfileImage({ src, alt, fallbackName, className }: ProfileImageProps) {
  return (
    <img 
      src={src} 
      alt={alt}
      onError={(e) => { 
        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fallbackName) + '&background=ffffff&color=d35c24&size=256';
      }}
      className={className}
    />
  );
}
