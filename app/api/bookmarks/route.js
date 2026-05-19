import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleSavedProperty } from "@/lib/data";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const propertySlug = typeof body.propertySlug === "string" ? body.propertySlug.trim() : "";

    if (!propertySlug) {
      return NextResponse.json({ error: "Property slug is required." }, { status: 400 });
    }

    const result = await toggleSavedProperty(user.id, propertySlug);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to toggle bookmark", {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({ error: "Failed to update bookmark." }, { status: 500 });
  }
}
