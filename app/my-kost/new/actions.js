"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSeller } from "@/lib/auth";
import { createPropertyForUser } from "@/lib/data";
import { isValidEthAmount, normalizeEthInput } from "@/lib/eth";
import { saveListingImages, validateListingImageCount } from "@/lib/uploads";

export async function createKostAction(formData) {
  const user = await requireSeller();
  const title = String(formData.get("title") || "");
  const location = String(formData.get("location") || "");
  const distance = String(formData.get("distance") || "");
  const monthlyRentEth = normalizeEthInput(formData.get("monthlyRentEth"));
  const description = String(formData.get("description") || "");
  const uploadedFiles = formData
    .getAll("imageFiles")
    .filter((file) => typeof file === "object" && file && "size" in file);
  const amenitiesInput = String(formData.get("amenities") || "");
  const amenities = amenitiesInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!title.trim() || !location.trim() || !distance.trim() || !description.trim()) {
    redirect("/my-kost/new?error=Please fill in all required listing fields.");
  }

  if (!monthlyRentEth) {
    redirect("/my-kost/new?error=Monthly ETH rent is required.");
  }

  if (!isValidEthAmount(monthlyRentEth)) {
    redirect("/my-kost/new?error=Monthly ETH rent must be greater than 0 and use at most 18 decimals.");
  }

  let uploadedImagePaths = [];

  try {
    validateListingImageCount(uploadedFiles);
    uploadedImagePaths = await saveListingImages(uploadedFiles);
  } catch (error) {
    redirect(`/my-kost/new?error=${encodeURIComponent(error.message)}`);
  }

  const allImageUrls = uploadedImagePaths;

  await createPropertyForUser(user.id, {
    title,
    location,
    distance,
    monthlyRentEth,
    imageUrl: allImageUrls[0],
    imageUrls: allImageUrls,
    description,
    amenities
  });

  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/my-kost");
  revalidatePath("/admin");
  redirect("/my-kost?success=Kost listing submitted for admin approval.");
}
