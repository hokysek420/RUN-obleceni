import React from 'react';
import Link from 'next/link';

interface RunLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export default function RunLogo({ className = '', size = 'md', showSubtitle = false }: RunLogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-12',
    xl: 'h-16 sm:h-20',
  };

  return (
    <Link href="/" className={`inline-flex flex-col items-start group select-none ${className}`}>
      <div className="flex items-center gap-1.5">
        <svg
          viewBox="0 0 240 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses[size]} w-auto text-white transition-transform duration-300 group-hover:scale-[1.02]`}
        >
          {/* RUN Sharp Vector Silhouette inspired by brand embroidery */}
          <path
            d="M5 64L35 4H102C122 4 135 14 130 29C126 42 112 49 92 49L80 50L112 64H86L58 50H45L36 64H5ZM50 37H82C94 37 103 33 105 26C107 19 101 16 88 16H58L50 37Z"
            fill="currentColor"
          />
          <path
            d="M108 4L117 4L100 50C96 59 104 64 117 64C131 64 142 59 146 50L163 4H180L163 50C155 64 137 70 118 70C97 70 85 62 90 49L108 4Z"
            fill="currentColor"
          />
          <path
            d="M182 4H202L206 36L238 4H258L220 45L250 64H226L201 47L194 64H175L182 4Z"
            fill="currentColor"
          />
          {/* Aggressive lightning slash */}
          <polygon points="12,50 30,58 2,64" fill="currentColor" />
          <polygon points="215,64 265,58 250,52" fill="currentColor" />
        </svg>
      </div>
      {showSubtitle && (
        <span className="text-[9px] tracking-widest text-[#71717a] uppercase font-mono mt-0.5">
          CLOTHING / EST. 2026
        </span>
      )}
    </Link>
  );
}
