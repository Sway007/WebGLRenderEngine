import { vec2, vec3 } from "gl-matrix";
import { BaseNode, Direction, Sprite } from "../../lib";
import { Ball, Paddle, Brick, Movable } from "../utils/GameObjects";
import { GameLevel, GameInfo } from "./Constants";

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
   * @returns 碰撞方向
   */
  static checkCollision(ball: Ball, block: Sprite): Direction | undefined {
    const ballCenter = ball.getCenter2D();
    const blockCenter = block.getCenter2D();

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

    if (innerLen + ball.getCollisionRadius() >= centerOffsetLength) {
      for (const directionInfo of block.getDirectionInfos()) {
        if (
          vec2.dot(centerOffsetVec, directionInfo.vec) >= directionInfo.minCos
        ) {
          return directionInfo.dir;
        }
      }
    }
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
      ball.setVelocity([2, -2]);
      ball.setPositionLimits([
        0,
        this.size.width - ball.width,
        0,
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

    // 碰撞检测、反弹
    if (this.ball) {
      for (const brick of this.bricks) {
        const colliedDir = Game.checkCollision(this.ball, brick);
        if (!brick.isCrashed && colliedDir) {
          brick.crash();
          this.ball.rebound(colliedDir);
          break;
        }
      }

      if (this.ball.getPosition()[1] <= this.paddle.height) {
        const colliedDir2 = Game.checkCollision(this.ball, this.paddle);
        if (colliedDir2) {
          this.ball.rebound(colliedDir2);
          const curV = this.ball.getVelocity();
          this.ball.setVelocity([curV[0], Math.abs(curV[1])]);
        }
      }
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
