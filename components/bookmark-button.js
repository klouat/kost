"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BookmarkButton({ propertySlug, initialIsSaved = false }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          propertySlug
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update bookmark.");
      }

      setIsSaved(Boolean(payload.isSaved));
      router.refresh();
    } catch (error) {
      console.error("Bookmark update failed", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      aria-label={isSaved ? "Remove bookmark" : "Save bookmark"}
      aria-pressed={isSaved}
      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed"
    >
      <span className={`text-lg leading-none ${isSaved ? "text-[var(--primary)]" : ""}`} aria-hidden="true">
        {isSaved ? "★" : "☆"}
      </span>
    </button>
  );
}
