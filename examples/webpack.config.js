const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanTerminalPlugin = require("clean-terminal-webpack-plugin");

const path = require("path");

const devServer = {
  port: 9000,
  hot: true,
  // writeToDisk: true,
  stats: "errors-only",
  host: "0.0.0.0",
};

module.exports = (env, argv) => {
  const mode = argv.mode || "development";
  return {
    entry: {
      main: path.resolve(__dirname, "react/index.tsx"),
    },
    output: {
      path: path.resolve(__dirname, "output"),
      filename: "[name].[contenthash].js",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    devServer,
    devtool: mode === "development" && "source-map",
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
          test: /\.(png|jpe?g)$/,
          use: "file-loader",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "index.html"),
      }),
      new ProgressBarPlugin(),
      new CleanWebpackPlugin(),
      new CleanTerminalPlugin({
        message: `dev server running on http://localhost:${devServer.port}`,
      }),
    ],
  };
};
