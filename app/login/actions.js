"use server";

import { loginUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=Email and password are required.");
  }

  try {
    await loginUser({ email, password });
  } catch (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
