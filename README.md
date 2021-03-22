## 工程目录结构

### - Engine

- renders

  - BaseNode.ts

    渲染基类

  - Sprite.ts

    图片精灵，渲染单张 2D 图片

- Constants.ts

  Shader 相关常变量

- Shader.ts

  Shader 类，封装了 Shader 创建、变量设置等底层 WebGL API

- Texture.ts

  Texture 类，封装了纹理创建、参数设置等底层 WebGL API

### - lib

> 引擎构建产物，运行 `npm run build` 生成

### - dist/webgl-game.js

> 由 webpack 构建的 UMD 包，支持浏览器以\<script\>脚本形式导入

### - examples

> 基于渲染引擎和 React 开发的 demo 工程 - h5 小游戏

- components

  - 性能统计数据面板组件

- react

  Canvas 窗口工程

- utils

  游戏逻辑相关代码

  - Game.ts

    游戏主逻辑

  - GameObjects.ts

    游戏对象类

  - ResourceManager.ts

    资源加载类

  - index.ts

    一些工具函数

## TODO

1. 渲染相关

   0. 兼容微信小程序 Canvas WebGL 1.0 Context
   1. 加入渲染节点树机制
   2. 加入 FrameBuffer 相关渲染功能
   3. 渲染引擎集成 Camera 相机系统
   4. 渲染引擎集成光照系统
   5. 支持 FrameBuffer 离屏渲染功能
   6. 完善单元测试代码

   ......

## 运行 Demo 游戏

```bash
cd ${项目根目录}
npm i

npm run build

# 安装样例工程依赖
cd ${项目根目录}/examples
npm i

cd ${项目根目录}
npm run demo
```

## 开发命令

```bash
npm run test # 运行单元测试

npm run dev-engine # 进入引擎开发模式

npm run build # 渲染引擎工程构建

npm run demo # 进入Demo工程开发模式，启动devServer
```
