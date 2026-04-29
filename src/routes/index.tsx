import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameLayout } from "@/components/GameLayout";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Users, Bot, Globe, BookOpen } from "lucide-react";
import horseWhite from "@/assets/horse-white.png";
import horseBlack from "@/assets/horse-black.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Matunga — Jogo de estratégia com movimento de cavalo" },
      {
        name: "description",
        content:
          "Matunga: jogo de tabuleiro 6x6 onde você forma um L com 4 cavalos para vencer. Jogue local, online ou contra a IA.",
      },
      { property: "og:title", content: "Matunga — Estratégia com cavalos" },
      {
        property: "og:description",
        content: "Forme um L com 4 cavalos. Jogue local, online ou contra a IA.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  return (
    <GameLayout showHome={false}>
      <section className="text-center mb-10 animate-float-in">
        <div className="flex justify-center items-end gap-2 mb-4">
          <img src={horseWhite} alt="" width={120} height={120} className="drop-shadow-lg animate-celebrate" />
          <img src={horseBlack} alt="" width={120} height={120} className="drop-shadow-lg animate-celebrate" style={{ animationDelay: "0.35s" }} />
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">Matunga</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
          Mova seus cavalos em <strong>L</strong> e seja o primeiro a formar um <strong>L com 4 peças</strong>.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <ModeCard
          icon={<Users className="h-8 w-8" />}
          title="2 jogadores no mesmo dispositivo"
          desc="Jogue passando o turno com um amigo ao seu lado."
          onClick={() => navigate({ to: "/play/local" })}
        />
        <ModeCard
          icon={<Bot className="h-8 w-8" />}
          title="Contra a IA"
          desc="Escolha entre fácil, médio e difícil."
          onClick={() => navigate({ to: "/play/ai" })}
        />
        <ModeCard
          icon={<Globe className="h-8 w-8" />}
          title="Online com código de sala"
          desc="Crie uma sala e compartilhe o código com seu oponente."
          onClick={() => navigate({ to: "/play/online" })}
        />
        <ModeCard
          icon={<BookOpen className="h-8 w-8" />}
          title="Aprender as regras"
          desc="Vovó cavalo te explica como jogar."
          onClick={() => navigate({ to: "/rules" })}
        />
      </div>

      <Card className="mt-6 max-w-3xl mx-auto p-5 bg-card/90 backdrop-blur">
        <p className="text-sm font-semibold mb-2">Entrar em uma sala rápida:</p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) navigate({ to: "/play/online/$code", params: { code: code.trim().toUpperCase() } });
          }}
        >
          <Input
            placeholder="CÓDIGO"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="uppercase tracking-widest font-bold"
          />
          <Button type="submit">Entrar</Button>
        </form>
      </Card>
    </GameLayout>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-card/90 backdrop-blur rounded-2xl p-5 shadow-lg border-2 border-border hover-scale transition-all hover:shadow-xl hover:border-primary"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/15 text-primary">{icon}</div>
        <div>
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>
      </div>
    </button>
  );
}
