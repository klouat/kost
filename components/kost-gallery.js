"use client";

import { useState } from "react";
import Image from "next/image";

export function KostGallery({ title, imageUrls }) {
  const galleryImages = Array.isArray(imageUrls) && imageUrls.length ? imageUrls : [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (!galleryImages.length) {
    return null;
  }

  const canNavigate = galleryImages.length > 1;

  function showPreviousImage() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === 0) {
        return galleryImages.length - 1;
      }

      return currentIndex - 1;
    });
  }

  function showNextImage() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === galleryImages.length - 1) {
        return 0;
      }

      return currentIndex + 1;
    });
  }

  return (
    <div>
      <div className="relative h-[420px] w-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {galleryImages.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="relative h-full w-full shrink-0">
              <Image
                src={imageUrl}
                alt={`${title} gallery ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {canNavigate ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-semibold text-[#111827] shadow-sm transition hover:scale-[1.03]"
              aria-label="Show previous image"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-semibold text-[#111827] shadow-sm transition hover:scale-[1.03]"
              aria-label="Show next image"
            >
              &#8250;
            </button>
            <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
              {activeIndex + 1} / {galleryImages.length}
            </div>
          </>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="grid grid-cols-2 gap-3 px-6 py-6 sm:grid-cols-4 md:px-8">
          {galleryImages.map((imageUrl, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-24 overflow-hidden rounded-[20px] border transition ${
                  isActive
                    ? "border-[var(--foreground)] ring-2 ring-[var(--foreground)]/10"
                    : "border-transparent hover:border-[var(--border)]"
                }`}
                aria-label={`Show image ${index + 1}`}
              >
                <Image
                  src={imageUrl}
                  alt={`${title} gallery ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
