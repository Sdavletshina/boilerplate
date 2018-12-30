const { resolve } = require('path');

module.exports = {
  entry: ['@babel/polyfill', './client/index'], // assumes your entry point is the app.js in the client folder
  mode: 'development',
  output: {
    path: __dirname, // assumes your bundle.js will also be in the root of your project folder
    filename: './public/bundle.js',
  },
  context: __dirname,
  devtool: 'source-maps',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: resolve(__dirname, 'client'),
        loader: 'babel-loader',
      },
      // use the style-loader/css-loader combos for anything matching the .css extension
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
