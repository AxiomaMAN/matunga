import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Send, Smile } from "lucide-react";
import type { Player } from "@/lib/matunga";

import wLaugh from "@/assets/emoji-white-laugh.png";
import wCry from "@/assets/emoji-white-cry.png";
import wScared from "@/assets/emoji-white-scared.png";
import wAngry from "@/assets/emoji-white-angry.png";
import bLaugh from "@/assets/emoji-black-laugh.png";
import bCry from "@/assets/emoji-black-cry.png";
import bScared from "@/assets/emoji-black-scared.png";
import bAngry from "@/assets/emoji-black-angry.png";

type EmojiKey =
  | "white-laugh" | "white-cry" | "white-scared" | "white-angry"
  | "black-laugh" | "black-cry" | "black-scared" | "black-angry";

export const EMOJI_MAP: Record<EmojiKey, string> = {
  "white-laugh": wLaugh,
  "white-cry": wCry,
  "white-scared": wScared,
  "white-angry": wAngry,
  "black-laugh": bLaugh,
  "black-cry": bCry,
  "black-scared": bScared,
  "black-angry": bAngry,
};

const EMOJI_OPTIONS: { key: EmojiKey; label: string }[] = [
  { key: "white-laugh", label: "Branco rindo" },
  { key: "white-cry", label: "Branco chorando" },
  { key: "white-scared", label: "Branco assustado" },
  { key: "white-angry", label: "Branco bravo" },
  { key: "black-laugh", label: "Preto rindo" },
  { key: "black-cry", label: "Preto chorando" },
  { key: "black-scared", label: "Preto assustado" },
  { key: "black-angry", label: "Preto bravo" },
];

interface Message {
  id: string;
  player_id: string;
  player_color: "white" | "black";
  kind: "text" | "emoji";
  content: string;
  created_at: string;
}

interface Props {
  roomId: string;
  myColor: Player | null;
  myPlayerId: string;
}

export function ChatBox({ roomId, myColor, myPlayerId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("matunga_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (!cancelled && data) setMessages(data as Message[]);
    })();
    return () => { cancelled = true; };
  }, [roomId]);

  // realtime
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matunga_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => {
            const m = payload.new as Message;
            if (prev.some((p) => p.id === m.id)) return prev;
            return [...prev, m];
          });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // autoscroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const canSend = !!myColor;

  const send = async (kind: "text" | "emoji", content: string) => {
    if (!myColor || !content.trim()) return;
    await supabase.from("matunga_messages").insert({
      room_id: roomId,
      player_id: myPlayerId,
      player_color: myColor,
      kind,
      content,
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setText("");
    await send("text", v.slice(0, 200));
  };

  return (
    <Card className="p-2 bg-card/95 flex flex-col h-64">
      <div className="px-1 pb-1 text-xs font-semibold text-muted-foreground">Chat</div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 px-1 py-1 text-sm"
      >
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center pt-4">
            Diga olá ao seu oponente! 🐴
          </p>
        )}
        {messages.map((m) => {
          const mine = m.player_id === myPlayerId;
          return (
            <div
              key={m.id}
              className={cn(
                "flex",
                mine ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-2 py-1 max-w-[80%] break-words",
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.kind === "text" ? (
                  <span>{m.content}</span>
                ) : (
                  <img
                    src={EMOJI_MAP[m.content as EmojiKey]}
                    alt="emoji cavalo"
                    width={48}
                    height={48}
                    loading="lazy"
                    className="w-12 h-12"
                  />
                )}
                <div className={cn(
                  "text-[10px] opacity-70 mt-0.5",
                  mine ? "text-right" : "text-left",
                )}>
                  {m.player_color === "white" ? "Brancas" : "Pretas"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showEmojis && canSend && (
        <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-md mb-1">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e.key}
              type="button"
              title={e.label}
              onClick={() => { send("emoji", e.key); setShowEmojis(false); }}
              className="rounded hover:bg-background/80 p-1 transition-colors"
            >
              <img src={EMOJI_MAP[e.key]} alt={e.label} width={40} height={40} className="w-10 h-10 mx-auto" />
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex gap-1">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => setShowEmojis((v) => !v)}
          disabled={!canSend}
          aria-label="Emojis"
        >
          <Smile className="h-4 w-4" />
        </Button>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={canSend ? "Mensagem…" : "Apenas jogadores"}
          disabled={!canSend}
          maxLength={200}
          className="h-9"
        />
        <Button type="submit" size="icon" disabled={!canSend || !text.trim()} aria-label="Enviar">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
