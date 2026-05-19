"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { approvePropertyBySlug, denyPropertyBySlug } from "@/lib/data";

export async function approveListingAction(formData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "");

  if (!slug) {
    redirect("/admin");
  }

  await approvePropertyBySlug(slug);

  revalidatePath("/admin");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/my-kost");
  revalidatePath(`/kost/${slug}`);

  redirect("/admin?success=Listing approved.");
}

export async function denyListingAction(formData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "");

  if (!slug) {
    redirect("/admin");
  }

  await denyPropertyBySlug(slug);

  revalidatePath("/admin");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/my-kost");
  revalidatePath(`/kost/${slug}`);

  redirect("/admin?success=Listing denied.");
}
