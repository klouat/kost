"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { upsertPropertyReview } from "@/lib/data";

export async function submitPropertyReviewAction(propertySlug, formData) {
  const user = await requireUser();

  if (user.role !== "buyer") {
    redirect(`/kost/${propertySlug}?reviewError=Only buyers can leave reviews.`);
  }

  const rating = Number(formData.get("rating") || 0);
  const comment = String(formData.get("comment") || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(`/kost/${propertySlug}?reviewError=Please choose a star rating from 1 to 5.`);
  }

  if (comment.length < 8) {
    redirect(`/kost/${propertySlug}?reviewError=Please write at least 8 characters in your review.`);
  }

  try {
    await upsertPropertyReview({
      userId: user.id,
      propertySlug,
      rating,
      comment
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save your review.";
    redirect(`/kost/${propertySlug}?reviewError=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath(`/kost/${propertySlug}`);
  revalidatePath("/dashboard");

  redirect(`/kost/${propertySlug}?reviewSuccess=Review saved.`);
}
