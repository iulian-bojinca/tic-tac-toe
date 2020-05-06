/** @jsx jsx */
import { jsx } from "@emotion/core";
import "./styles.css";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

const gridSize = 3;
const boxSize = 100;

const winningStates = boxes => ({
  byRow: () =>
    Object.keys(boxes)
      .reduce((acc, i) => {
        acc[i.split("-")[0]] = (acc[i.split("-")[0]] || []).concat(boxes[i]);
        return acc;
      }, [])
      .map((i, k) => ({
        id: k,
        boxes: i
      }))
      .filter(
        row =>
          row.boxes.filter(i => i === "x").length === gridSize ||
          row.boxes.filter(i => i === "o").length === gridSize
      )[0],
  byColumn: () =>
    Object.keys(boxes)
      .reduce((acc, i) => {
        acc[i.split("-")[1]] = (acc[i.split("-")[1]] || []).concat(boxes[i]);
        return acc;
      }, [])
      .filter(
        row =>
          row.filter(i => i === "x").length === gridSize ||
          row.filter(i => i === "o").length === gridSize
      )[0] || [],
  byLeftToRightDiagonal: () => {
    const diagonalBoxes = Object.keys(boxes).filter(
      i => Math.abs(i.split("-")[0] - 0) === Math.abs(i.split("-")[1] - 0)
    );

    return (
      [
        diagonalBoxes.filter(i => boxes[i] === "x"),
        diagonalBoxes.filter(i => boxes[i] === "o")
      ].filter(i => i.length === gridSize)[0] || []
    );
  },
  byRightToLeftDiagonal: () => {
    const diagonalBoxes = Object.keys(boxes).filter(
      i =>
        Math.abs(i.split("-")[0] - 0) ===
        Math.abs(i.split("-")[1] - gridSize + 1)
    );

    return (
      [
        diagonalBoxes.filter(i => boxes[i] === "x"),
        diagonalBoxes.filter(i => boxes[i] === "o")
      ].filter(i => i.length === gridSize)[0] || []
    );
  }
});

const TicTacToeMachine = Machine({
  id: "TicTacToe",
  initial: "playing",
  context: {
    turn: "x",
    boxes: Array.from(new Array(gridSize), (_, i) =>
      Array.from(new Array(gridSize), (_, j) => ({
        [`${i}-${j}`]: ""
      }))
    )
      .flat()
      .reduce((acc, i) => ({ ...acc, ...i }), {})
  },
  states: {
    playing: {
      on: {
        "": [
          {
            target: "over.won.byRow",
            cond: (context, _) => winningStates(context.boxes).byRow(),
            actions: assign((context, _) => ({
              ...context,
              winnerRow: winningStates(context.boxes).byRow().id
            }))
          }
        ],
        TURN_OVER: {
          target: "playing",
          cond: (context, event) => !context.boxes[event.boxID],
          actions: assign((context, event) => ({
            ...context,
            turn: {
              x: "o",
              o: "x"
            }[context.turn],
            boxes: {
              ...context.boxes,
              [event.boxID]: context.turn
            }
          }))
        }
      }
    },
    over: {
      states: {
        won: {
          states: {
            byRow: { type: "final" },
            byColumn: {},
            byLeftToRightDiagonal: {},
            byRightToLeftDiagonal: {}
          }
        },
        draw: {}
      }
    }
  }
});

export default function App() {
  const [current, send] = useMachine(TicTacToeMachine);

  console.log(current.context);

  return (
    <div
      className="App"
      css={{
        display: "grid",
        width: `${gridSize * boxSize}px`,
        height: `${gridSize * boxSize}px`,
        gridTemplate: `repeat(${gridSize}, 1fr)/repeat(${gridSize}, 1fr)`,
        position: "relative"
      }}
    >
      {Array.from(new Array(gridSize), (_, i) =>
        Array.from(new Array(gridSize), (_, j) => (
          <div
            key={`${i}-${j}`}
            data-position={`${i}-${j}`}
            css={{
              display: "flex",
              border: "1px solid black",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "50px",
              div: {
                width: "100%",
                height: "100%"
              }
            }}
            onClick={e =>
              send("TURN_OVER", { boxID: e.target.dataset.position })
            }
          >
            {current.context.boxes[`${i}-${j}`]}
          </div>
        ))
      )}
      {current.matches({ over: "won" }) && (
        <div
          css={{
            position: "absolute",
            backgroundColor: "red",
            ...(current.matches({ over: { won: "byRow" } }) && {
              height: "2px",
              width: "100%",
              top: `${current.context.winnerRow * boxSize + boxSize / 2}px`
            })
          }}
        />
      )}
    </div>
  );
}
