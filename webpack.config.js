const { merge } = require("webpack-merge");
const baseConfig = require("./build/webpack.common");
const devConfig = require("./build/webpack.dev");
const prodConfig = require("./build/webpack.prod");
const chalk = require("chalk");

module.exports = (env, argv) => {
  const mode = argv.mode || "development";
  console.log(chalk.blue("Mode: ") + chalk.bold.green(mode));

  switch (mode) {
    case "production":
      return merge({ mode }, baseConfig, prodConfig);
    case "development":
      return merge({ mode }, baseConfig, devConfig);
    default:
      throw new Error(`No matching mode: ${mode} configuration was found!`);
  }
};
