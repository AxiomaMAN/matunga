import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameBoard } from "@/components/GameBoard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Board,
  Player,
  applyMove,
  checkWinner,
  getOrCreatePlayerId,
  initialBoard,
} from "@/lib/matunga";
import { TurnCard } from "./play.local";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { ChatBox } from "@/components/ChatBox";

export const Route = createFileRoute("/play/online/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Sala ${params.code} — Matunga` },
      { name: "description", content: "Partida online de Matunga." },
    ],
  }),
  component: OnlineRoom,
});

interface RoomRow {
  id: string;
  code: string;
  board: Board;
  turn: Player;
  winner: Player | null;
  player_white: string | null;
  player_black: string | null;
}

function OnlineRoom() {
  const { code } = Route.useParams();
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const playerId = getOrCreatePlayerId();

  // initial fetch + atomic join via RPC
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("join_matunga_room", {
        _code: code,
        _player_id: playerId,
      });
      if (cancelled) return;
      if (error || !data) {
        console.error("[matunga] join error", error);
        setNotFound(true);
        setLoading(false);
        return;
      }
      // RPC returning a composite returns an object, but supabase-js may wrap it as array
      const r = (Array.isArray(data) ? data[0] : data) as RoomRow;
      setRoom(r);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, playerId]);

  // safety polling: refetch every 3s in case realtime drops
  useEffect(() => {
    if (!room) return;
    const i = setInterval(async () => {
      const { data } = await supabase
        .from("matunga_rooms")
        .select("*")
        .eq("id", room.id)
        .maybeSingle();
      if (data) setRoom(data as unknown as RoomRow);
    }, 3000);
    return () => clearInterval(i);
  }, [room?.id]);

  // realtime subscription
  useEffect(() => {
    if (!room) return;
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matunga_rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          if (payload.new) setRoom(payload.new as unknown as RoomRow);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  if (loading) return <GameLayout title="Carregando sala…"><div /></GameLayout>;

  if (notFound)
    return (
      <GameLayout title="Sala não encontrada" subtitle={`Código ${code} inválido`}>
        <div className="text-center">
          <Button asChild><Link to="/play/online">Voltar</Link></Button>
        </div>
      </GameLayout>
    );

  if (!room) return null;

  const myColor: Player | null =
    room.player_white === playerId ? "white" :
    room.player_black === playerId ? "black" : null;

  const opponentJoined = !!room.player_white && !!room.player_black;

  const onMove = async (
    _from: [number, number],
    _to: [number, number],
    next: Board,
    win: boolean,
  ) => {
    if (!myColor) return;
    const newTurn: Player = myColor === "white" ? "black" : "white";
    const winner = win ? myColor : null;
    // optimistic
    setRoom((prev) => prev && { ...prev, board: next, turn: newTurn, winner });
    const { error } = await supabase
      .from("matunga_rooms")
      .update({ board: next as any, turn: newTurn, winner, updated_at: new Date().toISOString() })
      .eq("id", room.id);
    if (error) toast.error("Erro ao sincronizar a jogada");
  };

  const reset = async () => {
    const { error } = await supabase
      .from("matunga_rooms")
      .update({ board: initialBoard() as any, turn: "white", winner: null })
      .eq("id", room.id);
    if (error) toast.error("Erro ao reiniciar");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  return (
    <GameLayout
      title={`Sala ${code}`}
      subtitle={
        myColor
          ? `Você joga com as ${myColor === "white" ? "brancas" : "pretas"}`
          : "Você é espectador (sala cheia)"
      }
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start justify-items-center">
        <div className="order-2 md:order-1 w-full max-w-xs space-y-3">
          <Card className="p-3 bg-card/95 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Código da sala</p>
              <p className="font-bold text-2xl tracking-widest">{code}</p>
            </div>
            <Button onClick={copyCode} size="icon" variant="secondary">
              <Copy className="h-4 w-4" />
            </Button>
          </Card>

          {!opponentJoined && (
            <Card className="p-4 bg-accent/40 text-center text-sm animate-pulse">
              Aguardando oponente entrar com o código…
            </Card>
          )}

          <TurnCard turn={room.turn} winner={room.winner} />

          <ChatBox roomId={room.id} myColor={myColor} myPlayerId={playerId} />

          {myColor && (
            <Button onClick={reset} variant="secondary" className="w-full">
              Reiniciar partida
            </Button>
          )}
        </div>

        <div className="order-1 md:order-2">
          <GameBoard
            board={room.board}
            turn={room.turn}
            winner={room.winner}
            controls={myColor ? [myColor] : null}
            locked={!opponentJoined}
            onMove={onMove}
          />
        </div>
      </div>
    </GameLayout>
  );
}
