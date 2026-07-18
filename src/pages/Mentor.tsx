import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Loader2, Plus, Send, Trash2, MessageSquare, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Thread = { id: string; title: string; updated_at: string };
type Message = { id: string; role: "user" | "assistant" | "system"; content: string; created_at: string };

export default function Mentor() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load thread list
  const loadThreads = async () => {
    const { data } = await supabase
      .from("mentor_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    setThreads(data ?? []);
    return data ?? [];
  };

  useEffect(() => {
    (async () => {
      const list = await loadThreads();
      if (!threadId) {
        if (list.length) navigate(`/mentor/${list[0].id}`, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages for active thread
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("mentor_messages")
        .select("id, role, content, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) ?? []);
    })();
  }, [threadId]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, isSending]);

  const createThread = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("mentor_threads")
      .insert({ user_id: user.id, title: "Nouvelle conversation" })
      .select("id, title, updated_at")
      .single();
    if (error || !data) {
      toast.error("Impossible de créer la conversation");
      return;
    }
    setThreads((t) => [data, ...t]);
    navigate(`/mentor/${data.id}`);
  };

  const deleteThread = async (id: string) => {
    if (!confirm("Supprimer cette conversation ?")) return;
    const { error } = await supabase.from("mentor_threads").delete().eq("id", id);
    if (error) return toast.error("Suppression impossible");
    const remaining = threads.filter((t) => t.id !== id);
    setThreads(remaining);
    if (threadId === id) {
      navigate(remaining[0] ? `/mentor/${remaining[0].id}` : "/mentor", { replace: true });
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    let activeId = threadId;

    if (!activeId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("mentor_threads")
        .insert({ user_id: user.id, title: "Nouvelle conversation" })
        .select("id, title, updated_at")
        .single();
      if (!data) return toast.error("Erreur");
      activeId = data.id;
      setThreads((t) => [data, ...t]);
      navigate(`/mentor/${data.id}`);
    }

    setInput("");
    setIsSending(true);
    setStreaming("");

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ threadId: activeId, message: text }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
        toast.error(err.error || "Échec");
        setIsSending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }

      // Finalize: refetch messages to get real IDs
      const { data } = await supabase
        .from("mentor_messages")
        .select("id, role, content, created_at")
        .eq("thread_id", activeId)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) ?? []);
      setStreaming("");
      // Refresh thread list (title/updated_at)
      loadThreads();
    } catch (e) {
      console.error(e);
      toast.error("Erreur réseau");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeMessages = useMemo(() => {
    return streaming
      ? [...messages, { id: "streaming", role: "assistant" as const, content: streaming, created_at: "" }]
      : messages;
  }, [messages, streaming]);

  const content = (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn(
        "rounded-lg border bg-card",
        fullscreen ? "h-[calc(100vh-2rem)]" : "h-[calc(100vh-8rem)] min-h-[500px]"
      )}
    >
      <ResizablePanel defaultSize={25} minSize={15} maxSize={40} className="hidden md:block">
        <div className="flex flex-col h-full">
          <div className="p-3 border-b flex items-center justify-between gap-2">
            <h2 className="font-semibold text-sm">Conversations</h2>
            <Button size="sm" variant="ghost" onClick={createThread}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {threads.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">Aucune conversation.</p>
              )}
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-muted",
                    threadId === t.id && "bg-muted"
                  )}
                  onClick={() => navigate(`/mentor/${t.id}`)}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{t.title}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={75}>
        <div className="flex flex-col h-full">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-sidebar-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">Mentor Myles Munroe</p>
                <p className="text-xs text-muted-foreground">Style prophétique · Royaume · Purpose</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="md:hidden" onClick={createThread}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFullscreen((f) => !f)} title={fullscreen ? "Réduire" : "Plein écran"}>
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {activeMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-sidebar-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Écoute, mon ami…</h3>
                <p className="text-muted-foreground max-w-md text-sm">
                  Pose ta question sur le purpose, le leadership, le Royaume, ou toute conviction que tu veux affiner.
                  Je te répondrai dans l'esprit et la voix du Dr Myles Munroe.
                </p>
              </div>
            )}
            {activeMessages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 bg-primary text-primary-foreground">
                    <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[90%] md:max-w-[85%] prose prose-sm dark:prose-invert prose-headings:font-display prose-p:leading-relaxed max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {isSending && !streaming && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Le mentor réfléchit…
              </div>
            )}
          </div>

          <div className="border-t p-3">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pose ta question au mentor…"
                rows={2}
                className="resize-none min-h-[48px] max-h-40"
                disabled={isSending}
              />
              <Button onClick={sendMessage} disabled={isSending || !input.trim()} size="icon" className="h-11 w-11 flex-shrink-0">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
              Entrée pour envoyer · Maj+Entrée pour saut de ligne
            </p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-4">
        {content}
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Mentor</h1>
          <p className="text-sm text-muted-foreground">Discute avec un mentor incarnant la pensée du Dr Myles Munroe.</p>
        </div>
        {content}
      </div>
    </MainLayout>
  );
}
