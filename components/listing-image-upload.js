"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const MAX_LISTING_IMAGES = 10;

export function ListingImageUpload() {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const fileInputRef = useRef(null);

  const previewItems = useMemo(
    () =>
      previewUrls.map((url, index) => ({
        id: `${url}-${index}`,
        url,
        label: index === 0 ? "Cover image" : `Image ${index + 1}`
      })),
    [previewUrls]
  );

  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrls]);

  function handleChange(event) {
    const newFiles = Array.from(event.target.files || []);

    setCurrentFiles((prev) => {
      const combined = [...prev, ...newFiles].slice(0, MAX_LISTING_IMAGES);

      setPreviewUrls(combined.map((file) => URL.createObjectURL(file)));

      // Sync the hidden file input's files so the form carries all accumulated files
      if (fileInputRef.current && combined.length > 0) {
        const dataTransfer = new DataTransfer();
        combined.forEach((file) => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
      }

      return combined;
    });

    event.target.value = "";
  }

  function removeImage(index) {
    setCurrentFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);

      setPreviewUrls(next.map((file) => URL.createObjectURL(file)));

      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        next.forEach((file) => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
      }

      return next;
    });
  }

  const atLimit = previewUrls.length >= MAX_LISTING_IMAGES;
  const remainingSlots = MAX_LISTING_IMAGES - previewUrls.length;

  return (
    <div className="md:col-span-2">
      <label className="block">
        <span className="text-sm font-medium">Upload listing images</span>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            name="imageFiles"
            accept="image/*"
            multiple
            disabled={atLimit}
            onChange={handleChange}
            className="hidden"
          />
          <label
            htmlFor={undefined}
            onClick={(e) => {
              if (!atLimit) fileInputRef.current?.click();
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${atLimit ? "cursor-not-allowed border-[var(--border)] text-[var(--muted)]" : "border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--surface-soft)]"}`}
          >
            <span aria-hidden="true">+</span> Add images
          </label>
          <span className="text-sm text-[var(--muted)]">
            {previewUrls.length} / {MAX_LISTING_IMAGES} images
            {atLimit ? " (maximum reached)" : remainingSlots > 0 ? ` (${remainingSlots} remaining)` : ""}
          </span>
        </div>
      </label>
      <p className="mt-2 text-sm text-[var(--body)]">
        Upload up to 10 images. The first image becomes the cover image.
      </p>

      {previewItems.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewItems.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-white">
              <div className="relative h-40 w-full">
                <Image src={item.url} alt={item.label} fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  aria-label={`Remove ${item.label}`}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}
              </div>
              <div className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{item.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}