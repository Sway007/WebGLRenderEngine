// TODO 兼容 WebGL 1.0, 不支持 VAO

// type GLContext = WebGLRenderingContext | WebGL2RenderingContext;
type GLContext = WebGL2RenderingContext;
type COLOR = [number, number, number];
type vec3 = [number, number, number] | Float32Array;

interface SIZE_2D {
  width: number;
  height: number;
}

interface NodeOptions {
  gl: GLContext;
  name?: string;
  scale?: vec3;
  rotation?: vec3;
  position?: vec3;
}

interface SpriteOptions extends NodeOptions {
  width?: number;
  height?: number;
  image: TexImageSource;
  color?: COLOR;
}

declare module "*.vert" {
  const content: string;
  export default content;
}

declare module "*.frag" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

interface DeviceDelegate {
  /**
   * 获取显示设备视口尺寸
   */
  getViewport: () => SIZE_2D;
}

interface Performance {
  memory: any;
}
