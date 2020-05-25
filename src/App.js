/** @jsx jsx */
import { jsx } from "@emotion/core";
import "./styles.css";
import { useMachine } from "@xstate/react";
import { TicTacToeMachine, boardSize, cellSize } from "./TicTacToeMachine";

export default function App() {
  const [current, send] = useMachine(TicTacToeMachine);

  return (
    <div className="App">
      <div
        css={{
          display: "grid",
          width: `${boardSize * cellSize}px`,
          height: `${boardSize * cellSize}px`,
          gridTemplate: `repeat(${boardSize}, 1fr)/repeat(${boardSize}, 1fr)`,
          position: "relative"
        }}
      >
        {Array.from(new Array(boardSize), (_, i) =>
          Array.from(new Array(boardSize), (_, j) => (
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
                send("TURN_OVER", { cellID: e.target.dataset.position })
              }
            >
              {current.context.cells[`${i}-${j}`]}
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
                top: `${current.context.winnerRow * cellSize + cellSize / 2}px`
              }),
              ...(current.matches({ over: { won: "byColumn" } }) && {
                width: "2px",
                height: "100%",
                left: `${current.context.winnerColumn * cellSize +
                  cellSize / 2}px`
              }),
              ...(current.matches({
                over: { won: "byDiagonal" }
              }) && {
                background: `linear-gradient(to top ${
                  current.context.winnerDiagonal
                },
           transparent 0%,
           transparent calc(50% - 2px),
           red 50%,
           transparent calc(50% + 2px),
           transparent 100%)`,
                width: `${cellSize * boardSize}px`,
                height: `${cellSize * boardSize}px`
              })
            }}
          />
        )}
      </div>

      <button onClick={_ => send("RESET")}>Reset</button>
    </div>
  );
}
