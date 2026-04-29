import { useState, useEffect, useRef } from "react";
import {
  Board,
  Player,
  knightMoves,
  applyMove,
  checkWinner,
  initialBoard,
} from "@/lib/matunga";
import { HorsePiece } from "./HorsePiece";
import { playPlock, playInvalid, playApplause } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface Props {
  board: Board;
  turn: Player;
  winner: Player | null;
  /** Returns true if move was applied. */
  onMove: (from: [number, number], to: [number, number], next: Board, win: boolean) => void;
  /** Which player(s) the local user controls. null = spectator. */
  controls: Player[] | null;
  /** Disable interaction (e.g. waiting for opponent / AI thinking). */
  locked?: boolean;
}

export function GameBoard({ board, turn, winner, onMove, controls, locked }: Props) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [shake, setShake] = useState<[number, number] | null>(null);
  const lastWinner = useRef<Player | null>(null);

  useEffect(() => {
    if (winner && lastWinner.current !== winner) {
      lastWinner.current = winner;
      playApplause();
    }
    if (!winner) lastWinner.current = null;
  }, [winner]);

  const validMoves = selected ? knightMoves(board, selected[0], selected[1]) : [];

  const canControlTurn =
    !winner && !locked && controls !== null && controls.includes(turn);

  const handleCellClick = (r: number, c: number) => {
    if (winner) return;
    const cell = board[r][c];

    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) {
        setSelected(null);
        return;
      }
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
      if (isValid) {
        const next = applyMove(board, selected, [r, c]);
        const piece = board[sr][sc] as Player;
        const win = checkWinner(next, piece);
        playPlock();
        onMove(selected, [r, c], next, win);
        setSelected(null);
        return;
      }
      // invalid: shake the selected piece
      playInvalid();
      setShake(selected);
      setTimeout(() => setShake(null), 500);
      return;
    }

    if (!canControlTurn) return;
    if (cell === turn) setSelected([r, c]);
  };

  return (
    <div className="fence-border bg-[var(--color-pasture)] p-3 sm:p-4 inline-block">
      <div className="grid grid-cols-6 gap-0 rounded-md overflow-hidden">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isLight = (r + c) % 2 === 0;
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isHint =
              selected && validMoves.some(([vr, vc]) => vr === r && vc === c);
            const isShaking = shake?.[0] === r && shake?.[1] === c;

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={cn(
                  "relative aspect-square w-12 sm:w-16 md:w-20 flex items-center justify-center transition-colors",
                  isLight ? "bg-[var(--color-board-light)]" : "bg-[var(--color-board-dark)]",
                  isSelected && "bg-[var(--color-board-selected)]",
                  isHint && "bg-[var(--color-board-highlight)]",
                  canControlTurn && cell === turn && "cursor-pointer hover:brightness-110",
                )}
                aria-label={`linha ${r + 1}, coluna ${c + 1}`}
              >
                {cell && (
                  <HorsePiece
                    player={cell}
                    selected={isSelected}
                    shake={isShaking}
                    celebrate={!!winner && cell === winner}
                    size={48}
                  />
                )}
                {isHint && !cell && (
                  <span className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-foreground/40" />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

export const newBoard = initialBoard;
