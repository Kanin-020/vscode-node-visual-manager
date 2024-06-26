const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const extensionConfig = {
  target: 'node',
  mode: 'production',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devtool: 'nosources-source-map',
};

const webviewConfig = {
  target: 'web',
  mode: 'production', 
  entry: {
    available: './src/views/pages/availableWebview.jsx',
    sidebar: './src/views/pages/sidebarWebview.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'webview'),
    filename: '[name].bundle.js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.css'],
    fallback: {
      process: require.resolve('process/browser'),
      window: require.resolve('window-or-global'),
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      window: 'window-or-global',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devtool: 'source-map'
};

module.exports = [extensionConfig, webviewConfig];
