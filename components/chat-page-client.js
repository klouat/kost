"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const THREAD_POLL_INTERVAL_MS = 4000;
const MESSAGE_POLL_INTERVAL_MS = 2500;

export function ChatPageClient({ initialThreads, initialThreadId, initialMessages }) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState(initialThreadId || initialThreads[0]?.id || null);
  const [activeThread, setActiveThread] = useState(initialMessages?.thread || null);
  const [messages, setMessages] = useState(initialMessages?.messages || []);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) || activeThread || null,
    [activeThread, selectedThreadId, threads]
  );

  useEffect(() => {
    if (!selectedThreadId && threads.length) {
      setSelectedThreadId(threads[0].id);
    }
  }, [selectedThreadId, threads]);

  useEffect(() => {
    if (!selectedThreadId) {
      setActiveThread(null);
      setMessages([]);
      return;
    }

    let isCancelled = false;

    async function loadMessages() {
      try {
        const response = await fetch(`/api/chat/threads/${selectedThreadId}/messages`, {
          cache: "no-store"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load chat messages.");
        }

        if (!isCancelled) {
          setActiveThread(payload.thread);
          setMessages(payload.messages);
          setError("");
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load chat messages.");
        }
      }
    }

    loadMessages();
    const intervalId = window.setInterval(loadMessages, MESSAGE_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedThreadId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadThreads() {
      try {
        const response = await fetch("/api/chat/threads", {
          cache: "no-store"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load chat threads.");
        }

        if (!isCancelled) {
          setThreads(payload.threads);

          if (!payload.threads.some((thread) => thread.id === selectedThreadId)) {
            setSelectedThreadId(payload.threads[0]?.id || null);
          }
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load chat threads.");
        }
      }
    }

    loadThreads();
    const intervalId = window.setInterval(loadThreads, THREAD_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedThreadId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedThreadId || !draft.trim()) {
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`/api/chat/threads/${selectedThreadId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: draft
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to send message.");
      }

      setActiveThread(payload.thread);
      setMessages(payload.messages);
      setDraft("");
      setError("");

      const threadResponse = await fetch("/api/chat/threads", {
        cache: "no-store"
      });
      const threadPayload = await threadResponse.json();

      if (threadResponse.ok) {
        setThreads(threadPayload.threads);
      }
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSelectThread(threadId) {
    setSelectedThreadId(threadId);
    setError("");
    window.history.replaceState(null, "", `/chat?thread=${threadId}`);
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <p className="text-sm font-medium text-[var(--muted)]">Conversations</p>
          <h2 className="mt-1 text-2xl font-semibold">People you have chatted with</h2>
        </div>

        {threads.length ? (
          <div className="max-h-[72vh] overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => handleSelectThread(thread.id)}
                className={`flex w-full items-start gap-3 border-b border-[var(--border)] px-5 py-4 text-left transition last:border-b-0 ${
                  thread.id === selectedThreadId ? "bg-[var(--surface-soft)]" : "bg-white hover:bg-[var(--surface-soft)]"
                }`}
              >
                <Avatar imageUrl={thread.counterpartyImageUrl} name={thread.counterpartyName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--foreground)]">{thread.counterpartyName}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{thread.counterpartyRole}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-[var(--muted)]">{thread.lastMessageAt}</span>
                  </div>
                  <p className="mt-2 truncate text-sm text-[var(--body)]">{thread.propertyTitle}</p>
                  <p className="mt-1 truncate text-sm text-[var(--muted)]">{thread.lastMessagePreview}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-sm text-[var(--body)]">
            No chat threads yet. Once a buyer pays for a kost, the buyer and seller chat will appear here automatically.
          </div>
        )}
      </section>

      <section className="flex min-h-[72vh] flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-white">
        {selectedThread ? (
          <>
            <div className="border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-center gap-3">
                <Avatar imageUrl={selectedThread.counterpartyImageUrl} name={selectedThread.counterpartyName} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{selectedThread.counterpartyName}</p>
                  <p className="truncate text-sm text-[var(--body)]">
                    {selectedThread.propertyTitle} - Tx {shortenHash(selectedThread.transactionHash)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#fcfcfb] px-6 py-6">
              {messages.length ? (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-[24px] px-4 py-3 text-sm leading-6 ${
                        message.isMine ? "bg-[var(--primary)] text-white" : "bg-white text-[var(--foreground)]"
                      }`}
                    >
                      <p>{message.body}</p>
                      <p className={`mt-2 text-xs ${message.isMine ? "text-white/75" : "text-[var(--muted)]"}`}>
                        {message.isMine ? "You" : message.senderName} - {message.sentAt}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] bg-white px-4 py-4 text-sm text-[var(--body)]">
                  No messages yet. Start the conversation with the {selectedThread.counterpartyRole}.
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[var(--border)] px-6 py-5">
              {error ? <p className="mb-3 rounded-2xl bg-[#fff1f3] px-4 py-3 text-sm text-[#b32505]">{error}</p> : null}
              <div className="flex flex-col gap-3 md:flex-row">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Write a message about move-in, documents, timing, or anything related to the rental."
                  className="min-h-[88px] flex-1 rounded-[24px] border border-[var(--border)] px-4 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={isSending || !draft.trim()}
                  className="rounded-[24px] bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition disabled:bg-[var(--primary-disabled)] md:self-end"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-[var(--body)]">
            Choose a conversation from the left to start chatting live without reloading the page.
          </div>
        )}
      </section>
    </div>
  );
}

function Avatar({ imageUrl, name }) {
  if (imageUrl) {
    return <Image src={imageUrl} alt={name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />;
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-semibold text-[var(--foreground)]">
      {String(name || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

function shortenHash(value) {
  if (!value || value.length < 12) {
    return value || "-";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
