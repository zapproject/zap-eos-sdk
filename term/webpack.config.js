const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['shebang-loader', 'ts-loader'],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js' ]
  },
  output: {
    filename: 'node.js',
    path: path.resolve(__dirname, 'dist')
  }
};
