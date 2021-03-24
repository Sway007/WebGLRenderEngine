export interface GameLevel {
  describe: string;
  brickConfig: number[]; // 砖块排列
  rowCount: number;
}

export namespace GameInfo {
  export const Level_1: GameLevel = {
    describe: "第一关",
    rowCount: 15,
    // prettier-ignore
    brickConfig: [
      1, 1, 1, 1, 1, 0, 2, 2, 2, 2, 1, 1, 1, 1, 1,
      1, 1, 1, 3, 1, 1, 2, 0, 0, 2, 1, 1, 1, 1, 1,
      1, 1, 1, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 1, 1,
      1, 2, 2, 0, 1, 2, 0, 2, 0, 2, 1, 0, 0, 0, 1,
      1, 3, 3, 3, 1, 1, 0, 2, 0, 0, 3, 3, 3, 0, 0,
    ],
  };

  export function getBrickColor(t: number): COLOR {
    switch (t) {
      case 1:
        return [1, 0, 0];
      case 2:
        return [0, 1, 0];
      case 3:
        return [0, 0, 1];
      default:
        throw Error(`no color with type ${t}`);
    }
  }
}
