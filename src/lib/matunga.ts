// Matunga game logic — knight-movement strategy
export type Player = "white" | "black";
export type Cell = Player | null;
export type Board = Cell[][]; // 6x6 [row][col]

export const BOARD_SIZE = 6;

export const initialBoard = (): Board => {
  // Pieces alternate on left and right edges
  const b: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array<Cell>(BOARD_SIZE).fill(null),
  );
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (r % 2 === 0) {
      b[r][0] = "white";
      b[r][BOARD_SIZE - 1] = "black";
    } else {
      b[r][0] = "black";
      b[r][BOARD_SIZE - 1] = "white";
    }
  }
  return b;
};

const KNIGHT_OFFSETS: Array<[number, number]> = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

export const inBounds = (r: number, c: number) =>
  r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

export const knightMoves = (board: Board, r: number, c: number) => {
  const moves: Array<[number, number]> = [];
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc] === null) moves.push([nr, nc]);
  }
  return moves;
};

export const cloneBoard = (b: Board): Board => b.map((row) => [...row]);

export const applyMove = (
  b: Board,
  from: [number, number],
  to: [number, number],
): Board => {
  const nb = cloneBoard(b);
  nb[to[0]][to[1]] = nb[from[0]][from[1]];
  nb[from[0]][from[1]] = null;
  return nb;
};

/**
 * Win condition: 4 own pieces forming an "L" via knight-move connectivity.
 * The 4 pieces must form a connected cluster (each connected to at least one
 * other via a knight move) AND visually form an "L" shape (3 in a line +
 * 1 perpendicular at one end).
 *
 * We enumerate L-shapes: 3 collinear cells (orth) + 1 perpendicular at an
 * endpoint, in any orientation/rotation/reflection. Then verify that every
 * piece in the L is reachable from every other by knight moves restricted to
 * those 4 cells (i.e. the 4 cells are knight-connected as a subgraph).
 */
const knightDist = (a: [number, number], b: [number, number]) => {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
};

const isKnightConnected = (cells: Array<[number, number]>) => {
  // BFS on subgraph of 4 cells, edges where knight-distance applies
  const visited = new Set<number>([0]);
  const queue = [0];
  while (queue.length) {
    const i = queue.shift()!;
    for (let j = 0; j < cells.length; j++) {
      if (!visited.has(j) && knightDist(cells[i], cells[j])) {
        visited.add(j);
        queue.push(j);
      }
    }
  }
  return visited.size === cells.length;
};

const isLShape = (cells: Array<[number, number]>) => {
  if (cells.length !== 4) return false;
  // try every cell as "the foot" (the perpendicular one)
  for (let foot = 0; foot < 4; foot++) {
    const others = cells.filter((_, i) => i !== foot);
    // others must be 3 collinear (horiz or vert) and consecutive
    const rows = others.map((c) => c[0]);
    const cols = others.map((c) => c[1]);
    const allSameRow = rows.every((r) => r === rows[0]);
    const allSameCol = cols.every((c) => c === cols[0]);
    let line: Array<[number, number]> | null = null;
    if (allSameRow) {
      const sorted = [...others].sort((a, b) => a[1] - b[1]);
      if (sorted[1][1] - sorted[0][1] === 1 && sorted[2][1] - sorted[1][1] === 1)
        line = sorted;
    } else if (allSameCol) {
      const sorted = [...others].sort((a, b) => a[0] - b[0]);
      if (sorted[1][0] - sorted[0][0] === 1 && sorted[2][0] - sorted[1][0] === 1)
        line = sorted;
    }
    if (!line) continue;
    // foot must be adjacent (orthogonally) to one ENDPOINT of line, perpendicular to it
    const f = cells[foot];
    const endpoints = [line[0], line[2]];
    for (const ep of endpoints) {
      const dr = f[0] - ep[0];
      const dc = f[1] - ep[1];
      if (allSameRow) {
        // line horizontal → foot must be vertical neighbor of an endpoint
        if (dc === 0 && Math.abs(dr) === 1) return true;
      } else {
        // line vertical → foot must be horizontal neighbor of an endpoint
        if (dr === 0 && Math.abs(dc) === 1) return true;
      }
    }
  }
  return false;
};

export const checkWinner = (board: Board, player: Player): boolean => {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (board[r][c] === player) cells.push([r, c]);

  // Visual L: 3 collinear adjacent cells + 1 perpendicular at an endpoint.
  // (Knight-connectivity intentionally omitted: knight cannot reach an adjacent
  // square in one move, so requiring it would make the game unwinnable.)
  const n = cells.length;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++) {
          const four = [cells[a], cells[b], cells[c], cells[d]];
          if (isLShape(four)) return true;
        }
  return false;
};

export const allMovesFor = (
  board: Board,
  player: Player,
): Array<{ from: [number, number]; to: [number, number] }> => {
  const moves: Array<{ from: [number, number]; to: [number, number] }> = [];
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (board[r][c] === player) {
        for (const m of knightMoves(board, r, c))
          moves.push({ from: [r, c], to: m });
      }
  return moves;
};

// ---------- AI ----------
type AIDifficulty = "easy" | "medium" | "hard";

const scoreBoardFor = (board: Board, player: Player): number => {
  // Heuristic: count near-L formations (3-piece partial L's)
  const opponent: Player = player === "white" ? "black" : "white";
  if (checkWinner(board, player)) return 10000;
  if (checkWinner(board, opponent)) return -10000;

  const own: Array<[number, number]> = [];
  const opp: Array<[number, number]> = [];
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === player) own.push([r, c]);
      else if (board[r][c] === opponent) opp.push([r, c]);
    }

  // partial connectivity score
  const pairs = (arr: Array<[number, number]>) => {
    let count = 0;
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++)
        if (knightDist(arr[i], arr[j])) count++;
    return count;
  };
  return pairs(own) * 5 - pairs(opp) * 4;
};

export const chooseAIMove = (
  board: Board,
  player: Player,
  difficulty: AIDifficulty,
): { from: [number, number]; to: [number, number] } | null => {
  const moves = allMovesFor(board, player);
  if (moves.length === 0) return null;

  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Medium: 1-ply lookahead
  // Hard: 2-ply minimax
  const opponent: Player = player === "white" ? "black" : "white";
  const depth = difficulty === "hard" ? 2 : 1;

  const minimax = (
    b: Board,
    d: number,
    maximizing: boolean,
    alpha: number,
    beta: number,
  ): number => {
    if (d === 0 || checkWinner(b, player) || checkWinner(b, opponent))
      return scoreBoardFor(b, player);
    const current: Player = maximizing ? player : opponent;
    const myMoves = allMovesFor(b, current);
    if (myMoves.length === 0) return scoreBoardFor(b, player);
    if (maximizing) {
      let best = -Infinity;
      for (const m of myMoves) {
        const nb = applyMove(b, m.from, m.to);
        best = Math.max(best, minimax(nb, d - 1, false, alpha, beta));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const m of myMoves) {
        const nb = applyMove(b, m.from, m.to);
        best = Math.min(best, minimax(nb, d - 1, true, alpha, beta));
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
      return best;
    }
  };

  let bestScore = -Infinity;
  let bestMoves: typeof moves = [];
  for (const m of moves) {
    const nb = applyMove(board, m.from, m.to);
    const s = minimax(nb, depth - 1, false, -Infinity, Infinity);
    if (s > bestScore) {
      bestScore = s;
      bestMoves = [m];
    } else if (s === bestScore) {
      bestMoves.push(m);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
};

export const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

export const getOrCreatePlayerId = () => {
  if (typeof window === "undefined") return "ssr";
  const KEY = "matunga_player_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
};
