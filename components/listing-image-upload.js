"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const MAX_LISTING_IMAGES = 10;

export function ListingImageUpload() {
  const [previewUrls, setPreviewUrls] = useState([]);

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
    const files = Array.from(event.target.files || []).slice(0, MAX_LISTING_IMAGES);

    setPreviewUrls((current) => {
      for (const url of current) {
        URL.revokeObjectURL(url);
      }

      return files.map((file) => URL.createObjectURL(file));
    });
  }

  return (
    <div className="md:col-span-2">
      <label className="block">
        <span className="text-sm font-medium">Upload listing images</span>
        <input
          type="file"
          name="imageFiles"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
        />
      </label>
      <p className="mt-2 text-sm text-[var(--body)]">Upload up to 10 images. The first image becomes the cover image.</p>

      {previewItems.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewItems.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-white">
              <div className="relative h-40 w-full">
                <Image src={item.url} alt={item.label} fill unoptimized className="object-cover" />
              </div>
              <div className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{item.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
