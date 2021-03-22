const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const path = require("path");
const PROJ_ROOT = path.dirname(__dirname);

module.exports = {
  entry: {
    main: path.resolve(PROJ_ROOT, "src/index.ts"),
  },
  output: {
    path: path.resolve(PROJ_ROOT, "dist"),
    filename: "webgl-game.js",
    library: "webglGame",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
      },
      {
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(vert|frag)$/,
        use: "raw-loader",
      },
    ],
  },
  plugins: [new ProgressBarPlugin(), new CleanWebpackPlugin()],
  externals: {
    "gl-matrix": {
      root: "window",
      commonjs: "gl-matrix",
      commonjs2: "gl-matrix",
      amd: "gl-matrix",
    },
    chalk: "chalk",
  },
};
