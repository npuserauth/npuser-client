const NodemonPlugin = require('nodemon-webpack-plugin'); // Ding
const path = require('path')
module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve('./dist'),
    filename: 'main.js',
  },
  plugins: [
    new NodemonPlugin(), // Dong
  ],
  target: 'node'
};
