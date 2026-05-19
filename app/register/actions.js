"use server";

import { registerUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function registerAction(formData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "");

  if (!name.trim() || !email.trim() || !password.trim()) {
    redirect("/register?error=Name, email, and password are required.");
  }

  if (password.length < 8) {
    redirect("/register?error=Password must be at least 8 characters.");
  }

  try {
    await registerUser({ name, email, password, role });
  } catch (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
