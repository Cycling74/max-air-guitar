const path = require('path');

module.exports = {
  entry: {
    "handpose": "./ts/handpose.ts"
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
      path: path.resolve(__dirname, 'max-air-guitar/www/dist'),
      filename: '[name].js',
  },
};