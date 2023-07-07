const path = require("path");
module.exports = {
  mode: "development",
  entry: {
    util: ["babel-polyfill", "./frontend/jsx/util.jsx"],
    pixelsorter: ["babel-polyfill", "./frontend/jsx/pixelsorter.jsx"],
    sort_worker: "./core/sort_worker.js",
    ls: "./frontend/jsx/ls.jsx",
    player: "./frontend/jsx/player.jsx"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "frontend") + "/static/js/"
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]
  }
};
