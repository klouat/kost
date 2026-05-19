import crypto from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

const MAX_LISTING_IMAGES = 10;

export async function saveProfileImage(file) {
  if (!file || file.size === 0) {
    return "";
  }

  if (!String(file.type || "").startsWith("image/")) {
    throw new Error("Profile picture must be an image file.");
  }

  const extension = getExtension(file.name);
  const fileName = `${crypto.randomUUID()}${extension}`;
  const relativePath = `/uploads/profiles/${fileName}`;
  const absoluteDirectory = path.join(process.cwd(), "public", "uploads", "profiles");
  const absolutePath = path.join(absoluteDirectory, fileName);
  const bytes = await file.arrayBuffer();

  await mkdir(absoluteDirectory, { recursive: true });
  await writeFile(absolutePath, Buffer.from(bytes));

  return relativePath;
}

export async function saveListingImages(files) {
  const imageFiles = files.filter((file) => file && file.size > 0);

  if (imageFiles.length > MAX_LISTING_IMAGES) {
    throw new Error(`You can upload a maximum of ${MAX_LISTING_IMAGES} images.`);
  }

  const savedPaths = [];

  for (const file of imageFiles) {
    if (!String(file.type || "").startsWith("image/")) {
      throw new Error("All uploaded listing files must be images.");
    }

    const extension = getExtension(file.name);
    const fileName = `${crypto.randomUUID()}${extension}`;
    const relativePath = `/uploads/listings/${fileName}`;
    const absoluteDirectory = path.join(process.cwd(), "public", "uploads", "listings");
    const absolutePath = path.join(absoluteDirectory, fileName);
    const bytes = await file.arrayBuffer();

    await mkdir(absoluteDirectory, { recursive: true });
    await writeFile(absolutePath, Buffer.from(bytes));

    savedPaths.push(relativePath);
  }

  return savedPaths;
}

export function validateListingImageCount(uploadedImages) {
  const totalCount = uploadedImages.length;

  if (totalCount === 0) {
    throw new Error("Upload at least one listing image.");
  }

  if (totalCount > MAX_LISTING_IMAGES) {
    throw new Error(`You can upload a maximum of ${MAX_LISTING_IMAGES} listing images.`);
  }
}

function getExtension(fileName) {
  const extension = path.extname(fileName || "").toLowerCase();

  if (extension) {
    return extension;
  }

  return ".png";
}
