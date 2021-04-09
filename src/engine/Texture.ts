import { Counter } from "./Base";

export class Texture2D extends Counter {
  _texture: WebGLTexture;
  _data: TexImageSource;
  gl: GLContext;

  /**
   *
   * @param gl WebGL下文
   * @param image 图片数据
   * @param texUnit 纹理单元，默认为0
   */
  constructor(
    gl: GLContext,
    image: TexImageSource,
    texUnit: number = gl.TEXTURE0
  ) {
    super();
    const texture = gl.createTexture();
    if (!texture) {
      throw Error("failed to create texture");
    }
    this.init(gl, texture, image, texUnit);

    this.gl = gl;
    this._texture = texture;
    this._data = image;
  }

  protected init(
    gl: GLContext,
    texture: WebGLTexture,
    image: TexImageSource,
    texUnit: number = gl.TEXTURE0
  ) {
    // 翻转图片
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(texUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    // 参数设置
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * 将纹理绑定到 TEXTURE_2D
   */
  bind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
  }
}
