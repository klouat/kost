import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserChatThreads } from "@/lib/data";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const threads = await getUserChatThreads(user.id);

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Failed to load chat threads", {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({ error: "Failed to load chat threads." }, { status: 500 });
  }
}
