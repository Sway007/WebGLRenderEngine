import { Sprite } from "../../lib";
import { ResourceManager } from "./ResourceManager";
import ballImg from "../assets/awesomeface.png";
import blockImg from "../assets/block.png";
import solidBlockImg from "../assets/block_solid.png";
import paddleImg from "../assets/paddle.png";
import { vec2, vec3 } from "gl-matrix";

interface GameObjectOptions extends NodeOptions {
  name: string;
  width?: number;
  height?: number;
  color?: COLOR;
}

interface DirectionInfo {
  dir: Direction;
  vec: vec2;
  minCos: number;
}

export enum Direction {
  UP = 0,
  RIGHT,
  DOWN,
  LEFT,
}

enum BallStatus {
  ROLLING = 0,
  STUCK,
}

export namespace SpriteObject {
  /**
   * Sprite工厂函数
   */
  export async function makeSprite<T extends Sprite = Sprite>(
    delegate: DeviceDelegate,
    options: GameObjectOptions,
    imageUrl: string,
    cls: new (options: SpriteOptions) => T
  ): Promise<T> {
    return ResourceManager.loadImage(imageUrl).then((imgRes) => {
      const ret = new cls({
        ...options,
        image: imgRes,
      });
      ret.setDeviceDelegate(delegate);

      return ret;
    });
  }

  export async function makeBrick(
    delegate: DeviceDelegate,
    options: GameObjectOptions
  ) {
    return SpriteObject.makeSprite(delegate, options, blockImg, Sprite);
  }
}

abstract class Movable extends Sprite {
  protected velocity: vec2 = vec2.fromValues(0, 0);
  protected positionLimits: [number, number, number, number] | undefined;

  setVelocity(velocity: vec2) {
    this.velocity = velocity;
  }

  /**
   * 反弹，改变速度方向
   */
  rebound(direction: Direction) {
    if (direction === Direction.DOWN || direction === Direction.UP) {
      this.velocity = [this.velocity[0], -this.velocity[1]];
    } else {
      this.velocity = [-this.velocity[0], this.velocity[1]];
    }
  }

  /**
   * 设置活动返回
   * @param limits: [minX, maxX, minY, maxY]
   */
  setPositionLimits(limits: [number, number, number, number]) {
    this.positionLimits = limits;
  }

  move(): vec3 {
    !this.positionLimits &&
      (this.positionLimits = [
        0,
        this.deviceDelegate.getViewport().width,
        0,
        this.deviceDelegate.getViewport().height,
      ]);

    const [minX, maxX, minY, maxY] = this.positionLimits;

    this.position[0] = Math.min(
      Math.max(minX, this.position[0] + this.velocity[0]),
      maxX
    );
    this.position[1] = Math.min(
      Math.max(minY, this.position[1] + this.velocity[1]),
      maxY
    );

    return this.position;
  }
}

export class Ball extends Movable {
  private status: BallStatus = BallStatus.STUCK;
  private collisionRadius: number; // 碰撞半径

  static create(
    delegate: DeviceDelegate,
    options: GameObjectOptions,
    velocity?: vec2
  ): Promise<Ball> {
    return SpriteObject.makeSprite(delegate, options, ballImg, Ball).then(
      (ball) => {
        ball.setDeviceDelegate(delegate);
        velocity && (ball.velocity = velocity);

        if (options.width && options.height) {
          ball.setCollisionRadius(Math.max(ball.width, ball.height) / 2);
        }

        return ball;
      }
    );
  }

  setCollisionRadius(r: number) {
    this.collisionRadius = r;
  }

  getCollisionRadius() {
    return this.collisionRadius || 10;
  }

  move() {
    !this.positionLimits &&
      (this.positionLimits = [
        0,
        this.deviceDelegate.getViewport().width,
        0,
        this.deviceDelegate.getViewport().height,
      ]);

    vec3.add(
      this.position,
      this.position,
      vec3.fromValues(this.velocity[0], this.velocity[1], 0)
    );
    if (this.position[0] <= this.positionLimits[0]) {
      this.position[0] = this.positionLimits[0];
      this.velocity[0] *= -1;
    } else if (this.position[0] >= this.positionLimits[1]) {
      this.position[0] = this.positionLimits[1];
      this.velocity[0] *= -1;
    }

    if (this.position[1] <= this.positionLimits[2]) {
      this.position[1] = this.positionLimits[2];
      this.velocity[1] *= -1;
    } else if (this.position[1] >= this.positionLimits[3]) {
      this.position[1] = this.positionLimits[3];
      this.velocity[1] *= -1;
    }

    return this.position;
  }
}

export class Paddle extends Movable {
  static create(
    delegate: DeviceDelegate,
    options: GameObjectOptions,
    velocity?: vec2
  ): Promise<Paddle> {
    return SpriteObject.makeSprite(delegate, options, paddleImg, Paddle).then(
      (paddle) => {
        paddle.setDeviceDelegate(delegate);
        velocity && (paddle.velocity = velocity);
        return paddle;
      }
    );
  }
}

export class Brick extends Sprite {
  isCrashed: boolean = false;

  static create(
    delegate: DeviceDelegate,
    options: GameObjectOptions
  ): Promise<Brick> {
    return SpriteObject.makeSprite(delegate, options, blockImg, Brick).then(
      (brick) => {
        brick.setDeviceDelegate(delegate);
        return brick;
      }
    );
  }

  crash() {
    this.isCrashed = true;
  }

  render() {
    if (!this.isCrashed) super.render();
  }

  getDirectionInfos(): DirectionInfo[] {
    return [
      {
        dir: Direction.DOWN,
        vec: vec2.fromValues(0, -1),
        minCos: Math.abs(this.height / vec2.length([this.width, this.height])),
      },
      {
        dir: Direction.UP,
        vec: vec2.fromValues(0, 1),
        minCos: Math.abs(this.height / vec2.length([this.width, this.height])),
      },
      {
        dir: Direction.RIGHT,
        vec: vec2.fromValues(1, 0),
        minCos: Math.abs(this.width / vec2.length([this.width, this.height])),
      },
      {
        dir: Direction.LEFT,
        vec: vec2.fromValues(-1, 0),
        minCos: Math.abs(this.width / vec2.length([this.width, this.height])),
      },
    ];
  }
}

/**
 * 检测向量朝向
 * @param target 检测目标向量
 * @param directionInfos [{dir: 方向, minCos: 最小余弦值}]
 */
export function vectorDirection(
  target: vec2,
  directionInfos: DirectionInfo[]
): Direction {
  for (const info of directionInfos) {
    if (vec2.dot(info.vec, target) <= info.minCos) {
      return info.dir;
    }
  }
  throw new Error(`err in function vectorDirection, ${arguments}`);
}
