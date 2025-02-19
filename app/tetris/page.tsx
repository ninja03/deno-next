"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TETRIS_ROWS = 20;
const TETRIS_COLS = 10;
const BLOCK_SIZE = 30;

type Grid = (string | null)[][];

const createEmptyGrid = (): Grid =>
  Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null));

type Tetromino = {
  shape: number[][],
  color: string
};

const tetrominoes: Tetromino[] = [
  { shape: [[1,1,1,1]], color: "cyan" },
  { shape: [[0,1,0],[1,1,1]], color: "purple" },
  { shape: [[1,1],[1,1]], color: "yellow" },
  { shape: [[0,0,1],[1,1,1]], color: "orange" },
  { shape: [[1,0,0],[1,1,1]], color: "blue" },
  { shape: [[0,1,1],[1,1,0]], color: "green" },
  { shape: [[1,1,0],[0,1,1]], color: "red" }
];

const randomTetromino = (): Tetromino => {
  return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
};

interface ActivePiece {
  tetromino: Tetromino;
  x: number;
  y: number;
}

const rotateMatrix = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
};

const isValidPosition = (grid: Grid, shape: number[][], posX: number, posY: number): boolean => {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const x = posX + j;
        const y = posY + i;
        if (x < 0 || x >= TETRIS_COLS || y >= TETRIS_ROWS) return false;
        if (y >= 0 && grid[y][x]) return false;
      }
    }
  }
  return true;
};

const mergePiece = (grid: Grid, shape: number[][], posX: number, posY: number, color: string): Grid => {
  const newGrid = grid.map(row => row.slice());
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const x = posX + j;
        const y = posY + i;
        if (y >= 0) {
          newGrid[y][x] = color;
        }
      }
    }
  }
  return newGrid;
};

const clearLines = (grid: Grid): Grid => {
  const newGrid = grid.filter(row => row.some(cell => cell === null));
  const clearedLines = TETRIS_ROWS - newGrid.length;
  const newRows = Array.from({ length: clearedLines }, () => Array(TETRIS_COLS).fill(null));
  return [...newRows, ...newGrid];
};

export default function TetrisPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [active, setActive] = useState<ActivePiece>(() => {
    const tetromino = randomTetromino();
    const x = Math.floor((TETRIS_COLS - tetromino.shape[0].length) / 2);
    return { tetromino, x, y: -tetromino.shape.length };
  });
  const [gameOver, setGameOver] = useState(false);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let i = 0; i < TETRIS_ROWS; i++) {
      for (let j = 0; j < TETRIS_COLS; j++) {
        if (grid[i][j]) {
          ctx.fillStyle = grid[i][j]!;
          ctx.fillRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "white";
          ctx.strokeRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }

    // Draw active piece
    const { tetromino, x, y } = active;
    for (let i = 0; i < tetromino.shape.length; i++) {
      for (let j = 0; j < tetromino.shape[i].length; j++) {
        if (tetromino.shape[i][j]) {
          const posX = (x + j) * BLOCK_SIZE;
          const posY = (y + i) * BLOCK_SIZE;
          ctx.fillStyle = tetromino.color;
          ctx.fillRect(posX, posY, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "black";
          ctx.strokeRect(posX, posY, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = TETRIS_COLS * BLOCK_SIZE;
      canvas.height = TETRIS_ROWS * BLOCK_SIZE;
    }
    const interval = setInterval(() => {
      setActive(prev => {
        if (gameOver) return prev;
        const newY = prev.y + 1;
        if (isValidPosition(grid, prev.tetromino.shape, prev.x, newY)) {
          return { ...prev, y: newY };
        } else {
          const newGrid = mergePiece(grid, prev.tetromino.shape, prev.x, prev.y, prev.tetromino.color);
          const clearedGrid = clearLines(newGrid);
          setGrid(clearedGrid);
          const newTetromino = randomTetromino();
          const newX = Math.floor((TETRIS_COLS - newTetromino.shape[0].length) / 2);
          const initialY = -newTetromino.shape.length;
          if (!isValidPosition(clearedGrid, newTetromino.shape, newX, initialY)) {
            setGameOver(true);
            return prev;
          }
          return { tetromino: newTetromino, x: newX, y: initialY };
        }
      });
    }, 500);
    return () => clearInterval(interval);
  }, [grid, gameOver]);

  useEffect(() => {
    draw();
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft") {
        setActive(prev => {
          if (isValidPosition(grid, prev.tetromino.shape, prev.x - 1, prev.y)) {
            return { ...prev, x: prev.x - 1 };
          }
          return prev;
        });
      } else if (e.key === "ArrowRight") {
        setActive(prev => {
          if (isValidPosition(grid, prev.tetromino.shape, prev.x + 1, prev.y)) {
            return { ...prev, x: prev.x + 1 };
          }
          return prev;
        });
      } else if (e.key === "ArrowDown") {
        setActive(prev => {
          if (isValidPosition(grid, prev.tetromino.shape, prev.x, prev.y + 1)) {
            return { ...prev, y: prev.y + 1 };
          }
          return prev;
        });
      } else if (e.key === "ArrowUp") {
        setActive(prev => {
          const rotated = rotateMatrix(prev.tetromino.shape);
          if (isValidPosition(grid, rotated, prev.x, prev.y)) {
            return { ...prev, tetromino: { ...prev.tetromino, shape: rotated } };
          }
          return prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid, gameOver]);

  return (
    <main>
      <h1>テトリスを遊ぶ</h1>
      {gameOver && <div style={{ color: "red", fontSize: "24px" }}>ゲームオーバー</div>}
      <canvas ref={canvasRef} style={{ border: "1px solid #000" }} />
      <p>矢印キーで操作してください（左: 左移動, 右: 右移動, 上: 回転, 下: 早く落下）。</p>
    </main>
  );
}