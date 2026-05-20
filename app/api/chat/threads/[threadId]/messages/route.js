import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createChatMessage, getChatMessagesForThread } from "@/lib/data";

function parseThreadId(value) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export async function GET(_request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const resolvedParams = await params;
    const threadId = parseThreadId(resolvedParams.threadId);

    if (!threadId) {
      return NextResponse.json({ error: "Invalid chat thread." }, { status: 400 });
    }

    const result = await getChatMessagesForThread(user.id, threadId);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "Chat thread not found." ? 404 : 500;

    if (status === 500) {
      console.error("Failed to load chat messages", { error: message });
    }

    return NextResponse.json({ error: status === 404 ? message : "Failed to load chat messages." }, { status });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const resolvedParams = await params;
    const threadId = parseThreadId(resolvedParams.threadId);

    if (!threadId) {
      return NextResponse.json({ error: "Invalid chat thread." }, { status: 400 });
    }

    const body = await request.json();
    const message = typeof body.message === "string" ? body.message : "";
    const result = await createChatMessage({
      threadId,
      senderUserId: user.id,
      body: message
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      message === "Chat thread not found." || message === "Message cannot be empty." || message === "Message is too long."
        ? 400
        : 500;

    if (status === 500) {
      console.error("Failed to send chat message", { error: message });
    }

    return NextResponse.json({ error: status === 400 ? message : "Failed to send chat message." }, { status });
  }
}
