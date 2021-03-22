import { vec2, vec3, vec4, mat3, mat4 } from "gl-matrix";
import { Counter } from "./Base";

export class Shader extends Counter {
  _program: WebGLProgram;
  gl: GLContext;

  /**
   * WebGL 暂不支持 Geometry Shader
   * @param vertexSource 顶点着色器源码
   * @param fragmentSource 片元着色器源码
   */
  constructor(gl: GLContext, vertexSource: string, fragmentSource: string) {
    super();
    this._program = this.compile(gl, vertexSource, fragmentSource);
    this.gl = gl;
  }

  /**
   * 启用当前Shader程序
   */
  use() {
    this.gl.useProgram(this._program);
  }

  private getUniformLocation(name: string) {
    const loc = this.gl.getUniformLocation(this._program, name);
    if (!loc) {
      throw new Error(`找不到uniform变量: ${name}`);
    }
    return loc;
  }

  setFloat(name: string, val: number) {
    this.gl.uniform1f(this.getUniformLocation(name), val);
  }

  setInteger(name: string, val: number) {
    this.gl.uniform1i(this.getUniformLocation(name), val);
  }

  setVector2f(name: string, vec: vec2) {
    this.gl.uniform2f(this.getUniformLocation(name), vec[0], vec[1]);
  }

  setVector3f(name: string, vec: vec3) {
    this.gl.uniform3f(this.getUniformLocation(name), vec[0], vec[1], vec[2]);
  }

  setVector4f(name: string, vec: vec4) {
    this.gl.uniform4f(
      this.getUniformLocation(name),
      vec[0],
      vec[1],
      vec[2],
      vec[3]
    );
  }

  setMatrix4(name: string, matrix: mat4, transpose: boolean = false) {
    this.gl.uniformMatrix4fv(this.getUniformLocation(name), transpose, matrix);
  }

  setMatrix3(name: string, matrix: mat3, transpose: boolean = false) {
    this.gl.uniformMatrix3fv(this.getUniformLocation(name), transpose, matrix);
  }

  private compile(
    gl: GLContext,
    vertexSource: string,
    fragmentSource: string
  ): WebGLProgram {
    const sVertex = _createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const sFragment = _createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) {
      throw Error("failed to create gl program");
    }
    gl.attachShader(program, sVertex);
    gl.attachShader(program, sFragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(sVertex);
      gl.deleteShader(sFragment);
      throw Error("failed to link gl program");
    }
    return program;
  }
}

// ------------- 工具函数 --------------

function _createShader(
  gl: GLContext,
  type: number,
  content: string
): WebGLShader {
  const _shader = gl.createShader(type);
  if (!_shader) {
    console.error(content);
    throw EvalError("failed to create shader");
  }
  gl.shaderSource(_shader, content);
  gl.compileShader(_shader);
  if (!gl.getShaderParameter(_shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(_shader);
    console.error(content);
    gl.deleteShader(_shader);
    throw EvalError(log || "");
  }
  return _shader!;
}
