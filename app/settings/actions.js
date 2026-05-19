"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/data";
import { saveProfileImage } from "@/lib/uploads";

export async function updateSettingsAction(formData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "");
  const profileImageFile = formData.get("profileImage");

  if (!name.trim()) {
    redirect("/settings?error=Name is required.");
  }

  let profileImageUrl = user.profileImageUrl || "";

  try {
    if (profileImageFile && typeof profileImageFile === "object" && profileImageFile.size > 0) {
      profileImageUrl = await saveProfileImage(profileImageFile);
    }

    await updateUserProfile(user.id, {
      name,
      profileImageUrl
    });
  } catch (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings?success=Profile updated.");
}
