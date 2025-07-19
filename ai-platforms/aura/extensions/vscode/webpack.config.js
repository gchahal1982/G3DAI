const path = require('path');

module.exports = {
  target: 'node',
  mode: 'none',
  
  entry: './extensions/vscode/src/extension.ts',
  output: {
    path: path.resolve(__dirname, '../../dist/extensions/vscode'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  
  externals: {
    vscode: 'commonjs vscode'
  },
  
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, '../../src')
    }
  },
  
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, '../../tsconfig.json')
            }
          }
        ]
      }
    ]
  },
  
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log'
  }
}; 