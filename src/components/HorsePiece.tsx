import horseWhite from "@/assets/horse-white.png";
import horseBlack from "@/assets/horse-black.png";
import type { Player } from "@/lib/matunga";
import { cn } from "@/lib/utils";

interface Props {
  player: Player;
  selected?: boolean;
  shake?: boolean;
  celebrate?: boolean;
  size?: number;
}

export function HorsePiece({ player, selected, shake, celebrate, size = 56 }: Props) {
  return (
    <img
      src={player === "white" ? horseWhite : horseBlack}
      alt={player === "white" ? "Cavalo branco" : "Cavalo preto"}
      width={size}
      height={size}
      draggable={false}
      className={cn(
        "select-none transition-transform duration-200 pointer-events-none",
        selected && "piece-selected",
        shake && "animate-shake",
        celebrate && "animate-celebrate",
      )}
      style={{ width: size, height: size }}
    />
  );
}
