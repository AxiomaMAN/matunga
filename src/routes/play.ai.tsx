import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { GameBoard } from "@/components/GameBoard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  initialBoard,
  Board,
  Player,
  applyMove,
  checkWinner,
  chooseAIMove,
} from "@/lib/matunga";
import { TurnCard } from "./play.local";

type Difficulty = "easy" | "medium" | "hard";

export const Route = createFileRoute("/play/ai")({
  head: () => ({
    meta: [
      { title: "Matunga — Contra a IA" },
      { name: "description", content: "Jogue Matunga contra a IA com 3 níveis de dificuldade." },
    ],
  }),
  component: AIGame,
});

function AIGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [humanColor, setHumanColor] = useState<Player>("white");
  const [board, setBoard] = useState<Board>(initialBoard());
  const [turn, setTurn] = useState<Player>("white");
  const [winner, setWinner] = useState<Player | null>(null);
  const [thinking, setThinking] = useState(false);

  const aiColor: Player = humanColor === "white" ? "black" : "white";

  // AI move trigger
  useEffect(() => {
    if (!difficulty || winner) return;
    if (turn !== aiColor) return;
    setThinking(true);
    const t = setTimeout(() => {
      const move = chooseAIMove(board, aiColor, difficulty);
      if (!move) {
        setThinking(false);
        return;
      }
      const next = applyMove(board, move.from, move.to);
      const win = checkWinner(next, aiColor);
      setBoard(next);
      if (win) setWinner(aiColor);
      else setTurn(humanColor);
      setThinking(false);
    }, 600);
    return () => clearTimeout(t);
  }, [turn, board, difficulty, aiColor, humanColor, winner]);

  const reset = (color: Player = humanColor) => {
    setBoard(initialBoard());
    setTurn("white");
    setWinner(null);
    setHumanColor(color);
  };

  if (!difficulty) {
    return (
      <GameLayout title="Contra a IA" subtitle="Escolha a dificuldade">
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="bg-card/95 rounded-2xl p-6 shadow-lg border-2 border-border hover-scale hover:border-primary text-center"
            >
              <div className="text-4xl mb-2">{d === "easy" ? "🌱" : d === "medium" ? "🌿" : "🌳"}</div>
              <h3 className="font-bold text-xl">
                {d === "easy" ? "Fácil" : d === "medium" ? "Médio" : "Difícil"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {d === "easy" ? "Movimentos aleatórios" : d === "medium" ? "Olha 1 jogada à frente" : "Olha 2 jogadas à frente"}
              </p>
            </button>
          ))}
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title={`IA — ${difficulty === "easy" ? "Fácil" : difficulty === "medium" ? "Médio" : "Difícil"}`}
      subtitle={`Você joga com as ${humanColor === "white" ? "brancas" : "pretas"}`}
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start justify-items-center">
        <div className="order-2 md:order-1 w-full max-w-xs space-y-3">
          <TurnCard turn={turn} winner={winner} />
          {thinking && <p className="text-center text-sm text-muted-foreground animate-pulse">IA pensando…</p>}
          <Button onClick={() => reset(humanColor === "white" ? "black" : "white")} variant="secondary" className="w-full">
            Trocar de cor e reiniciar
          </Button>
          <Button onClick={() => reset()} variant="secondary" className="w-full">
            Reiniciar
          </Button>
          <Button onClick={() => setDifficulty(null)} variant="outline" className="w-full">
            Mudar dificuldade
          </Button>
        </div>
        <div className="order-1 md:order-2">
          <GameBoard
            board={board}
            turn={turn}
            winner={winner}
            controls={[humanColor]}
            locked={thinking}
            onMove={(_f, _t, next, win) => {
              setBoard(next);
              if (win) setWinner(humanColor);
              else setTurn(aiColor);
            }}
          />
        </div>
      </div>
    </GameLayout>
  );
}
