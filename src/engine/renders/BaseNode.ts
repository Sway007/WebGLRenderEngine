import { vec3, mat4, vec2 } from "gl-matrix";

import { Counter } from "../Base";
import { Shader } from "../Shader";

// 可渲染的基类节点
export abstract class BaseNode extends Counter {
  gl: GLContext;
  name?: string;
  vertexSource?: string;
  fragmentSource?: string;

  // 模型属性
  protected position: vec3 = vec3.fromValues(0, 0, 0);
  protected rotation: vec3 = vec3.fromValues(0, 0, 0);
  protected scale: vec3 = vec3.fromValues(1, 1, 1);
  protected modelMat: mat4 = mat4.create();

  deviceDelegate?: DeviceDelegate;

  protected VAO: WebGLVertexArrayObject | null = null;
  protected shader: Shader | null = null;

  constructor(options: NodeOptions) {
    super();
    this.gl = options.gl;
    this.name = options.name;
    options.position && (this.position = options.position);
    options.scale && (this.scale = options.scale);
    options.rotation && (this.rotation = options.rotation);
    this.initRenderData();
  }

  setShader(shader: Shader): void {
    this.shader = shader;
  }

  setShaderBySource(vertexSource: string, fragmentSource: string): void {
    this.shader = new Shader(this.gl, vertexSource, fragmentSource);
  }

  setDeviceDelegate(delegate: DeviceDelegate) {
    this.deviceDelegate = delegate;
  }

  setPosition(position: vec3) {
    this.position = position;
  }

  getPosition() {
    return this.position;
  }

  /**
   * 计算模型矩阵
   */
  protected computeModelMat() {
    const scaleMat = mat4.fromScaling(mat4.create(), this.scale);

    // 绕中心点旋转
    const anchorTranslateMat = mat4.fromTranslation(
      mat4.create(),
      vec3.fromValues(
        0.5 * this.scale[0],
        0.5 * this.scale[1],
        0.5 * this.scale[2]
      )
    );
    // 欧拉角旋转
    const rotationMat = mat4.create();
    mat4.rotateX(rotationMat, rotationMat, this.rotation[0]);
    mat4.rotateY(rotationMat, rotationMat, this.rotation[1]);
    mat4.rotateZ(rotationMat, rotationMat, this.rotation[2]);
    mat4.translate(
      rotationMat,
      rotationMat,
      vec3.fromValues(
        -0.5 * this.scale[0],
        -0.5 * this.scale[1],
        -0.5 * this.scale[2]
      )
    );
    mat4.multiply(rotationMat, anchorTranslateMat, rotationMat);

    const translateMat = mat4.fromTranslation(mat4.create(), this.position);

    const modelMat = mat4.create();
    mat4.multiply(modelMat, translateMat, rotationMat);
    mat4.multiply(modelMat, modelMat, scaleMat);

    this.modelMat = modelMat;

    // this.modelMat = scaleMat;
    // console.log(scaleMat, modelMat);
  }

  /**
   * 初始化VBO等顶点数据
   */
  protected abstract initRenderData(): any;

  /**
   * 渲染
   */
  abstract render(): void;
}
