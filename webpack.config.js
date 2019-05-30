const path = require('path');
module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'frontend') + "/es6/util.jsx",
  output:{
    filename: 'util.js',
    path: path.resolve(__dirname, 'frontend') + "/static/js/"
  },
  resolve: {
    extensions: ['.js', '.jsx']
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
  },
};
