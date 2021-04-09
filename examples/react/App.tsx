import React, { useEffect, useState, useMemo } from "react";

import { device } from "../utils";
import { Game } from "../utils/Game";
import { StatisticPanel } from "../components/StatisticPanel";

import "./App.scss";

export default function App() {
  const canvasWidth = 400,
    canvasHeight = 300;

  useEffect(() => {
    let game: Game | null = null;
    const canvasEl = document.getElementById(
      "game-canvas"
    ) as HTMLCanvasElement;
    device.setCanvasPixelRatio(canvasEl);
    const gl = canvasEl.getContext("webgl2");

    game = new Game(gl!, { width: canvasWidth, height: canvasHeight });

    requestAnimationFrame(game.animLoop.bind(game));
  }, []);

  return (
    <div id="root">
      <div className="title">Game Breakout</div>
      <div
        className="canvas--ctn"
        style={{
          width: canvasWidth * window.devicePixelRatio,
          height: canvasHeight * window.devicePixelRatio,
        }}
      >
        <StatisticPanel />
        {useMemo(
          () => (
            <canvas
              id="game-canvas"
              width={canvasWidth}
              height={canvasHeight}
            ></canvas>
          ),
          []
        )}
      </div>
    </div>
  );
}
