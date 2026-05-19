import { NextResponse } from "next/server";
import { getAllProperties } from "@/lib/data";

export async function GET() {
  try {
    const properties = await getAllProperties();

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Failed to fetch properties", error);

    return NextResponse.json(
      { error: "Failed to load properties." },
      { status: 500 }
    );
  }
}
