import { createFileRoute, Link } from "@tanstack/react-router";
import { GameLayout } from "@/components/GameLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import grandma from "@/assets/grandma-horse.png";
import horseBlack from "@/assets/horse-black.png";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Como jogar Matunga — Regras" },
      { name: "description", content: "Aprenda a jogar Matunga: movimento de cavalo, formação em L e como vencer." },
      { property: "og:title", content: "Como jogar Matunga" },
      { property: "og:description", content: "Vovó cavalo te ensina o movimento de cavalo e a formação em L." },
    ],
  }),
  component: Rules,
});

const LExamples = [
  // Each: rows of booleans (where horse appears)
  {
    label: "Vertical com pé à direita",
    grid: [
      [true, false],
      [true, false],
      [true, true],
    ],
  },
  {
    label: "Horizontal com pé abaixo",
    grid: [
      [true, true, true],
      [true, false, false],
    ],
  },
  {
    label: "Horizontal espelhado",
    grid: [
      [true, true, true],
      [false, false, true],
    ],
  },
];

function MiniGrid({ grid }: { grid: boolean[][] }) {
  return (
    <div className="inline-grid gap-1 p-2 rounded-lg bg-[var(--color-pasture)]"
      style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}>
      {grid.map((row, r) =>
        row.map((on, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-10 h-10 rounded ${
              (r + c) % 2 === 0 ? "bg-[var(--color-board-light)]" : "bg-[var(--color-board-dark)]"
            } flex items-center justify-center`}
          >
            {on && <img src={horseBlack} alt="" width={32} height={32} />}
          </div>
        )),
      )}
    </div>
  );
}

function Rules() {
  return (
    <GameLayout title="Como jogar" subtitle="Vovó cavalo te explica tudinho 🧶">
      <div className="grid md:grid-cols-[260px_1fr] gap-6 items-start">
        <div className="flex justify-center md:justify-end">
          <img src={grandma} alt="Vovó cavalo" width={260} height={260} className="drop-shadow-xl animate-float-in" />
        </div>
        <div className="space-y-4">
          <Card className="p-5 bg-card/95">
            <h2 className="font-bold text-xl mb-2">🐴 Movimento</h2>
            <p>
              Cada cavalo se move exatamente como no xadrez: <strong>2 casas em uma direção e 1 perpendicular</strong>,
              formando um “L”. Você não pode pousar em uma casa ocupada e <strong>não há captura</strong>.
            </p>
          </Card>

          <Card className="p-5 bg-card/95">
            <h2 className="font-bold text-xl mb-2">🎯 Como vencer</h2>
            <p className="mb-4">
              Vence quem formar um <strong>L com 4 peças próprias</strong>. As 4 peças precisam estar
              conectadas por movimentos válidos de cavalo. Veja exemplos (rotações e espelhamentos também valem):
            </p>
            <div className="flex flex-wrap gap-4">
              {LExamples.map((ex) => (
                <div key={ex.label} className="text-center">
                  <MiniGrid grid={ex.grid} />
                  <p className="text-xs text-muted-foreground mt-1">{ex.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-card/95">
            <h2 className="font-bold text-xl mb-2">🚫 Movimentos inválidos</h2>
            <p>
              Se você tentar um movimento que não é “L” de cavalo, a peça <strong>treme de irritação</strong> e
              o turno continua sendo seu — tente outra jogada!
            </p>
          </Card>

          <div className="text-center pt-2">
            <Button asChild size="lg">
              <Link to="/">Voltar e jogar 🎮</Link>
            </Button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
