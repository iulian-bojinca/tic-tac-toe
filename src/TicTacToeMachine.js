import { Machine, assign } from "xstate";

export const boardSize = 3;
export const cellSize = 100;

const isEmptyCell = (context, event) => !context.cells[event.cellID];

const cellSelected = assign((context, event) => ({
  ...context,
  turn: {
    x: "o",
    o: "x"
  }[context.turn],
  cells: {
    ...context.cells,
    [event.cellID]: context.turn
  }
}));

const resetGame = assign((context, _) => initialContext);

const winningStates = cells => ({
  byRow: () =>
    Object.keys(cells)
      .reduce((acc, i) => {
        acc[i.split("-")[0]] = (acc[i.split("-")[0]] || []).concat(cells[i]);
        return acc;
      }, [])
      .map((i, k) => ({
        id: k,
        cells: i
      }))
      .filter(
        row =>
          row.cells.filter(i => i === "x").length === boardSize ||
          row.cells.filter(i => i === "o").length === boardSize
      )[0],
  byColumn: () =>
    Object.keys(cells)
      .reduce((acc, i) => {
        acc[i.split("-")[1]] = (acc[i.split("-")[1]] || []).concat(cells[i]);
        return acc;
      }, [])
      .map((i, k) => ({
        id: k,
        cells: i
      }))
      .filter(
        row =>
          row.cells.filter(i => i === "x").length === boardSize ||
          row.cells.filter(i => i === "o").length === boardSize
      )[0],
  byRightDiagonal: () => {
    const diagonalCells = Object.keys(cells).filter(
      i => Math.abs(i.split("-")[0] - 0) === Math.abs(i.split("-")[1] - 0)
    );

    return [
      diagonalCells.filter(i => cells[i] === "x"),
      diagonalCells.filter(i => cells[i] === "o")
    ].filter(i => i.length === boardSize)[0];
  },
  byLeftDiagonal: () => {
    const diagonalCells = Object.keys(cells).filter(
      i =>
        Math.abs(i.split("-")[0] - 0) ===
        Math.abs(i.split("-")[1] - boardSize + 1)
    );

    return [
      diagonalCells.filter(i => cells[i] === "x"),
      diagonalCells.filter(i => cells[i] === "o")
    ].filter(i => i.length === boardSize)[0];
  }
});

const emptyBoard = Array.from(new Array(boardSize), (_, i) =>
  Array.from(new Array(boardSize), (_, j) => ({
    [`${i}-${j}`]: ""
  }))
)
  .flat()
  .reduce((acc, i) => ({ ...acc, ...i }), {});

const initialContext = {
  turn: "x",
  cells: emptyBoard
};

export const TicTacToeMachine = Machine({
  id: "TicTacToe",
  initial: "playing",
  context: initialContext,
  states: {
    playing: {
      on: {
        "": [
          {
            target: "over.won.byRow",
            cond: (context, _) => winningStates(context.cells).byRow(),
            actions: assign((context, _) => ({
              ...context,
              winnerRow: winningStates(context.cells).byRow().id
            }))
          },
          {
            target: "over.won.byColumn",
            cond: (context, _) => winningStates(context.cells).byColumn(),
            actions: assign((context, _) => ({
              ...context,
              winnerColumn: winningStates(context.cells).byColumn().id
            }))
          },
          {
            target: "over.won.byDiagonal",
            cond: (context, _) =>
              winningStates(context.cells).byRightDiagonal(),
            actions: assign((context, _) => ({
              ...context,
              winnerDiagonal: "right"
            }))
          },
          {
            target: "over.won.byDiagonal",
            cond: (context, _) => winningStates(context.cells).byLeftDiagonal(),
            actions: assign((context, _) => ({
              ...context,
              winnerDiagonal: "left"
            }))
          }
        ],
        TURN_OVER: {
          target: "playing",
          cond: isEmptyCell,
          actions: cellSelected
        },
        RESET: {
          target: "playing",
          actions: resetGame
        }
      }
    },
    over: {
      states: {
        won: {
          states: {
            byRow: { type: "final" },
            byColumn: { type: "final" },
            byDiagonal: { type: "final" }
          }
        },
        draw: {}
      },
      on: {
        RESET: {
          target: "playing",
          actions: resetGame
        }
      }
    }
  },
  actions: {
    cellSelected,
    resetGame
  },
  guards: {
    isEmptyCell
  }
});
