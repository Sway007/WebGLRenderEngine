import React, { useEffect } from "react";
import { debounce } from "../utils";

import "./StatisticPanel.scss";

export interface PerformanceStatistic {
  fps: number | string;
  memory: number | string;
}

let lastTimeStamp;
let okToSetInfo = true;

export function StatisticPanel() {
  const setFlag = debounce(() => {
    okToSetInfo = true;
  }, 100);

  useEffect(() => {
    const getPerformance = () => {
      const nowTS = performance.now();
      if (lastTimeStamp) {
        const elapse = nowTS - lastTimeStamp;
        const fps = Math.floor(1000 / elapse);
        const memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);

        if (okToSetInfo) {
          document.querySelector(".item.fps").textContent = `${fps}`;
          document.querySelector(".item.memory").textContent = `${memory}`;
          okToSetInfo = false;
        } else {
          setFlag();
        }
      }
      lastTimeStamp = nowTS;
      requestAnimationFrame(getPerformance);
    };
    getPerformance();
  });

  return (
    <div className="statistic-panel">
      <div>
        当前帧率: <span className="fps item"></span>
      </div>
      <div>
        内存使用: <span className="memory item"></span>(MB)
      </div>
    </div>
  );
}
