import React, { useState } from 'react';

const classPhotoExtensions = ['png', 'jpg', 'jpeg', 'webp'] as const;

const getClassPhotoUrl = (className: string, extensionIndex: number) =>
  `/ClassPhotos/${encodeURIComponent(className)}.${classPhotoExtensions[extensionIndex]}`;

interface ClassPhotoProps {
  classNameValue: string;
  alt: string;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'h-5 w-5 text-[9px]',
  md: 'h-6 w-6 text-[10px]',
} as const;

export const ClassPhoto: React.FC<ClassPhotoProps> = ({ classNameValue, alt, size = 'md' }) => {
  const [extensionIndex, setExtensionIndex] = useState(0);
  const dimensions = sizeClasses[size];

  if (!classNameValue || extensionIndex >= classPhotoExtensions.length) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-slate-500 ${dimensions}`}
      >
        ?
      </span>
    );
  }

  return (
    <img
      src={getClassPhotoUrl(classNameValue, extensionIndex)}
      alt={alt}
      className={`shrink-0 rounded-full border border-slate-700 object-cover ${dimensions}`}
      onError={() => setExtensionIndex((current) => current + 1)}
    />
  );
};
