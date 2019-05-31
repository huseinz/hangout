const path = require('path');
module.exports = {
  mode: 'development',
  entry: {
    util: './frontend/jsx/util.jsx',
    cv: './frontend/jsx/cv.jsx'
  },
  output:{
    filename: '[name].js',
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
