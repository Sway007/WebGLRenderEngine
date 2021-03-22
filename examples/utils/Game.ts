import { glMatrix, vec2, vec3 } from "gl-matrix";
import { BaseNode, Sprite } from "../../lib";
import { SpriteObject, Ball, Paddle, Brick } from "../utils/GameObjects";
import { GameLevel, GameInfo } from "./Constants";
import { throttle } from "../utils";

enum GameState {
  RUNNING = 1,
  IDLE,
}

export class Game implements DeviceDelegate {
  state: GameState = GameState.IDLE;
  size: SIZE_2D;
  gl: GLContext;

  // 关卡数据
  levelInfo: GameLevel = GameInfo.Level_1;

  bricks: Brick[] = [];
  ball: Ball;
  paddle: Paddle;

  /**
   * AABB圆形碰撞检测
   * @param ball 球体
   * @param block 矩形体
   */
  static checkCollision(ball: Ball, block: Sprite) {
    const ballPos = ball.getPosition();
    const blockPos = block.getPosition();

    const ballCenter: vec2 = [
      ballPos[0] + ball.width / 2,
      ballPos[1] + ball.height / 2,
    ];
    const blockCenter: vec2 = [
      blockPos[0] + block.width / 2,
      blockPos[1] + block.height / 2,
    ];

    const centerOffsetVec = vec2.sub(vec2.create(), ballCenter, blockCenter);
    const centerOffsetLength = vec2.length(centerOffsetVec);
    const absCos = Math.abs(
      vec2.dot(centerOffsetVec, vec2.fromValues(1, 0)) / centerOffsetLength
    );
    const absSin = Math.sqrt(1 - absCos * absCos);

    const innerLen = Math.min(
      block.width / (2 * absCos),
      block.height / (2 * absSin)
    );

    return innerLen + ball.getCollisionRadius() >= centerOffsetLength;
    // const ret = innerLen + ball.getCollisionRadius() >= centerOffsetLength;
    // if (ret) {
    //   console.log(
    //     ballPos,
    //     blockPos,
    //     ballCenter,
    //     blockCenter,
    //     innerLen,
    //     centerOffsetLength,
    //     centerOffsetVec,
    //     absCos,
    //     absSin
    //   );
    //   debugger;
    // }
    // return ret;
  }

  /**
   * 每一帧都执行的回调
   */
  protected _loopCb: (timeStamp: number) => void | null = null;

  /**
   * 需要绘制的节点数组
   */
  private drawableNodes: BaseNode[] = [];

  constructor(gl: GLContext, size: SIZE_2D) {
    this.size = size;
    this.gl = gl;
    this.init();
  }

  init() {
    console.log("game init");
    this.loadObjects();
    this.registerEvents();
  }

  private loadObjects() {
    const { gl } = this;
    const self = this;

    this.loadGameLevel();

    const sizePaddle = {
      width: this.size.width / 10,
      height: (this.size.width / 10) * 0.3,
    };
    const posPaddle: vec3 = [this.size.width / 2 - sizePaddle.width / 2, 0, 0];

    const sizeBall = { width: sizePaddle.height, height: sizePaddle.height };
    const posBall: vec3 = [
      this.size.width / 2 - sizeBall.width / 2,
      sizePaddle.height,
      0,
    ];

    Ball.create(this, {
      gl,
      ...sizeBall,
      name: "ball",
      position: posBall,
      color: [Math.random(), Math.random(), Math.random()],
    }).then((ball) => {
      ball.setVelocity([2, 2]);
      ball.setPositionLimits([
        0,
        this.size.width - ball.width,
        sizePaddle.height,
        this.size.height - ball.height,
      ]);
      this.ball = ball;
      this.drawableNodes.push(ball);
    });

    Paddle.create(this, {
      gl,
      name: "paddle",
      ...sizePaddle,
      position: posPaddle,
    }).then((paddle) => {
      paddle.setPositionLimits([0, this.size.width - paddle.width, 0, 0]);
      this.paddle = paddle;
      this.drawableNodes.push(paddle);
    });
  }

  private registerEvents() {
    document.addEventListener("keydown", (e) => {
      const k = e.key;
      switch (k) {
        case "ArrowLeft":
        case "a":
          this.paddle.setVelocity([-2, 0]);
          break;
        case "ArrowRight":
        case "d":
          this.paddle.setVelocity([2, 0]);
          break;
        case " ":
          this.state =
            this.state === GameState.IDLE ? GameState.RUNNING : GameState.IDLE;
          break;
      }
    });
    document.addEventListener("keyup", (e) => {
      const k = e.key;
      switch (k) {
        case "ArrowLeft":
        case "a":
        case "ArrowRight":
        case "d":
          this.paddle.setVelocity([0, 0]);
          break;
      }
    });
  }

  private loadGameLevel() {
    if (!this.levelInfo) throw Error("null level info");

    const { gl, levelInfo } = this;
    const { width: canvasWidth, height: canvasHeight } = this.size;
    const brickWidth = canvasWidth / this.levelInfo.rowCount;
    const brickHeight = brickWidth * 0.6;

    const getPos = (x: number, y: number): vec3 => [
      x * brickWidth,
      canvasHeight - (y + 1) * brickHeight,
      0,
    ];

    for (const [i, t] of levelInfo.brickConfig.entries()) {
      const y = Math.floor(i / levelInfo.rowCount),
        x = i % levelInfo.rowCount;

      t &&
        Brick.create(this, {
          gl,
          width: brickWidth,
          height: brickHeight,
          name: `brick_${i}`,
          position: getPos(x, y),
          color: GameInfo.getBrickColor(t),
        }).then((brick) => {
          this.drawableNodes.push(brick);
          this.bricks.push(brick);
        });
    }
  }

  private update() {
    const { gl } = this;
    gl.clearColor(0.7, 0.7, 0.7, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.state !== GameState.RUNNING) return;

    // 碰撞检测
    if (this.ball) {
      this.bricks.forEach((brick) => {
        if (Game.checkCollision(this.ball, brick)) {
          brick.crash();
        }
      });
    }

    this.ball?.move();
    this.paddle?.move();
  }

  /**
   * 游戏主循环
   */
  animLoop(timestamp: number): void {
    this.update();

    // render nodes ...
    for (const node of this.drawableNodes) {
      node.render();
    }

    if (this._loopCb) this._loopCb(timestamp);

    requestAnimationFrame(this.animLoop.bind(this));
  }

  getViewport() {
    return this.size;
  }

  /**
   * 设置每一帧渲染完成后执行的回调
   */
  setLoopCb(cb: (t: number) => void) {
    this._loopCb = cb;
  }
}
