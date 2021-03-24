import { BaseNode } from "./BaseNode";
import { Shader } from "../Shader";
import { SHADER_LOC, SHADER_VAR_NAME, SHADER } from "../Constants";
import { Texture2D } from "../Texture";
import { mat4, vec3, vec2 } from "gl-matrix";

export interface DirectionInfo {
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

export class Sprite extends BaseNode {
  texture?: Texture2D;
  width: number;
  height: number;
  color: COLOR = [1, 1, 1];

  constructor(options: SpriteOptions) {
    super(options);
    const { image, width, height, color, gl } = options;
    this.width = width || image.width;
    this.height = height || image.height;
    this.scale = vec3.fromValues(this.width, this.height, 1);
    this.texture = new Texture2D(options.gl, image);

    if (color) this.color = color;

    // 设置shader
    const shader = new Shader(gl, SHADER.VERTEX_SPRITE, SHADER.FRAGMENT_SPRITE);
    this.setShader(shader);
  }

  /**
   * 设置图片
   * @param image
   */
  setFrame(image: TexImageSource) {
    this.texture = new Texture2D(this.gl, image);
  }

  initRenderData() {
    const { gl } = this;

    // prettier-ignore
    const vertices = new Float32Array([
    // pos   tex
      0, 1,   0, 1,
      1, 0,   1, 0,
      0, 0,   0, 0,

      0, 1,   0, 1,
      1, 1,   1, 1,
      1, 0,   1, 0,
    ]);
    const VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    if (!VBO) throw new Error("failed to create buffer");

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // TODO WebGL 1.0 不支持VAO绑定，需兼容
    const VAO = gl.createVertexArray();
    if (!VAO) throw new Error("failed to create VAO");

    this.VAO = VAO;

    // 设置 VAO
    gl.bindVertexArray(this.VAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.enableVertexAttribArray(SHADER_LOC.VERTEX);
    gl.vertexAttribPointer(
      SHADER_LOC.VERTEX,
      4,
      gl.FLOAT,
      false,
      4 * vertices.BYTES_PER_ELEMENT,
      0
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  render() {
    if (!this.shader)
      throw new Error(
        "渲染前请先调用setShader/setShaderBySource设置shader程序"
      );

    if (!this.deviceDelegate)
      throw new Error("渲染前请先调用setDeviceDelegate");

    const { gl, VAO } = this;

    this.shader.use();

    const { width, height } = this.deviceDelegate.getViewport();
    const projectionMatrix = mat4.ortho(
      mat4.create(),
      0,
      width,
      0,
      height,
      -100,
      100
    );
    this.shader.setMatrix4(SHADER_VAR_NAME.MAT_PROJECT, projectionMatrix);

    this.computeModelMat();

    this.shader.setMatrix4(SHADER_VAR_NAME.MAT_MODEL, this.modelMat);
    this.shader.setVector3f(
      SHADER_VAR_NAME.SPRITE.COLOR,
      this.color || [1, 1, 1]
    );

    if (this.texture) {
      this.shader.setInteger(SHADER_VAR_NAME.TEX_0, 0);
      this.texture.bind();
    }
    gl.bindVertexArray(VAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
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
