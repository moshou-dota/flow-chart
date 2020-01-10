const Path = require('path')
const HtmlwebpackPlugin = require('html-webpack-plugin')

function resolve(path) {
  return Path.join(__dirname, path)
}
module.exports = {
  entry: resolve('index.js'),
  output: {
    path: resolve('dist'),
    filename: 'main.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      { 
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/, 
        loader: 'file-loader' 
       }
    ]
  },
  plugins: [
    new HtmlwebpackPlugin({
      template: resolve('index.html')
    }),
  ]
}