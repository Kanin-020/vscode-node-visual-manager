const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const extensionConfig = {
  target: 'node',
  mode: 'production',
  entry: './src/extension/extension.ts',
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
    alias: {
      '@core': path.resolve(__dirname, 'src/extension/core'),
      '@infraestructure': path.resolve(__dirname, 'src/extension/infraestructure'),
      '@vscode': path.resolve(__dirname, 'src/extension/vscode'),
      '@web': path.resolve(__dirname, 'src/extension/web'),
    }
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
  devtool: false,
};

const webviewConfig = {
  target: 'web',
  mode: 'production',
  entry: {
    current: './src/extension/web/pages/currentVersionWebview.tsx',
    available: './src/extension/web/pages/availableVersionWebview.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'webview'),
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    assetModuleFilename: 'assets/icons/[name][ext]'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
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
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            url: {
              filter: (url) => !url.includes('.ttf'),
            },
          },
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
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
        { from: 'src/extension/web/assets/images', to: 'assets/images' },
        { from: 'node_modules/@vscode/codicons/dist/codicon.ttf', to: 'assets/icons/codicon.ttf' }
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devtool: false
};

module.exports = [extensionConfig, webviewConfig];
