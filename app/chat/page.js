import { redirect } from "next/navigation";
import { SectionTitle } from "@/components/section-title";
import { ChatPageClient } from "@/components/chat-page-client";
import { requireUser } from "@/lib/auth";
import { getChatMessagesForThread, getUserChatThreads } from "@/lib/data";

export const metadata = {
  title: "Chat | Kos Escrow"
};

export default async function ChatPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const user = await requireUser();

  if (user.role === "admin") {
    redirect("/admin");
  }

  const threads = await getUserChatThreads(user.id);
  const requestedThreadId = Number(resolvedSearchParams?.thread || 0);
  const initialThreadId =
    threads.find((thread) => thread.id === requestedThreadId)?.id || threads[0]?.id || null;
  const initialMessages = initialThreadId ? await getChatMessagesForThread(user.id, initialThreadId) : null;

  return (
    <div className="shell py-10">
      <SectionTitle
        eyebrow="Live chat"
        title="Talk with the other side of the transaction"
        description="Each paid transaction unlocks a direct buyer-seller chat. Conversations refresh automatically, so you do not need to reload the page."
      />

      <ChatPageClient
        initialThreads={threads}
        initialThreadId={initialThreadId}
        initialMessages={initialMessages}
      />
    </div>
  );
}
