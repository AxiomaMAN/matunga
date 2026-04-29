import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameBoard } from "@/components/GameBoard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { initialBoard, Board, Player } from "@/lib/matunga";
import { HorsePiece } from "@/components/HorsePiece";

export const Route = createFileRoute("/play/local")({
  head: () => ({
    meta: [
      { title: "Matunga — 2 jogadores local" },
      { name: "description", content: "Jogue Matunga com um amigo no mesmo dispositivo." },
    ],
  }),
  component: LocalGame,
});

function LocalGame() {
  const [board, setBoard] = useState<Board>(initialBoard());
  const [turn, setTurn] = useState<Player>("white");
  const [winner, setWinner] = useState<Player | null>(null);

  const reset = () => {
    setBoard(initialBoard());
    setTurn("white");
    setWinner(null);
  };

  return (
    <GameLayout title="Modo local" subtitle="Os dois jogadores se alternam neste dispositivo">
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start justify-items-center">
        <div className="order-2 md:order-1 w-full max-w-xs space-y-3">
          <TurnCard turn={turn} winner={winner} />
          <Button onClick={reset} variant="secondary" className="w-full">Reiniciar partida</Button>
        </div>
        <div className="order-1 md:order-2">
          <GameBoard
            board={board}
            turn={turn}
            winner={winner}
            controls={["white", "black"]}
            onMove={(_from, _to, next, win) => {
              setBoard(next);
              if (win) setWinner(turn);
              else setTurn(turn === "white" ? "black" : "white");
            }}
          />
        </div>
      </div>
    </GameLayout>
  );
}

export function TurnCard({ turn, winner }: { turn: Player; winner: Player | null }) {
  if (winner) {
    return (
      <Card className="p-4 bg-accent text-accent-foreground text-center animate-float-in">
        <div className="flex justify-center mb-2">
          <HorsePiece player={winner} celebrate size={64} />
        </div>
        <p className="font-bold text-xl">
          {winner === "white" ? "Brancas venceram!" : "Pretas venceram!"} 🎉
        </p>
      </Card>
    );
  }
  return (
    <Card className="p-4 bg-card/95 text-center">
      <p className="text-sm text-muted-foreground mb-2">É a vez de</p>
      <div className="flex justify-center mb-2">
        <HorsePiece player={turn} size={56} />
      </div>
      <p className="font-bold text-lg">{turn === "white" ? "Brancas" : "Pretas"}</p>
    </Card>
  );
}
