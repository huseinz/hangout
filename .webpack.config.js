const path = require('path');
module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src') + "/frontend/js/util.jsx",
  output:{
    filename: 'util.js',
    path: path.resolve(__dirname, 'static') + "/js/"
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
