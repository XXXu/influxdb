const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const webpack = require('webpack')
const {
  GIT_SHA,
  STATIC_DIRECTORY,
  BASE_PATH,
  API_BASE_PATH,
} = require('./src/utils/env')

module.exports = {
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: BASE_PATH,
    webassemblyModuleFilename: `${STATIC_DIRECTORY}[modulehash:10].wasm`,
    sourceMapFilename: `${STATIC_DIRECTORY}[name].js.map`,
  },
  entry: {
    app: './src/bootstrap.ts',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      react: path.resolve('./node_modules/react'),
    },
    extensions: ['.tsx', '.ts', '.js', '.wasm'],
  },
  module: {
    rules: [
      {
        test: /\flux_parser_bg.wasm$/,
        type: 'webassembly/experimental',
      },
      {
        test: /^((?!flux_parser_bg).)*.wasm$/,
        loader: 'file-loader',
        type: 'javascript/auto',
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'istanbul-instrumenter-loader',
            options: {esModules: true},
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              hmr: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${STATIC_DIRECTORY}[contenthash:10].[ext]`,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${STATIC_DIRECTORY}[contenthash:10].[ext]`,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './assets/index.html',
      favicon: './assets/images/favicon.ico',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
      base: BASE_PATH.slice(0, -1),
      header: process.env.INJECT_HEADER || '',
      body: process.env.INJECT_BODY || '',
    }),
    new MiniCssExtractPlugin({
      filename: `${STATIC_DIRECTORY}[contenthash:10].css`,
      chunkFilename: `${STATIC_DIRECTORY}[id].[contenthash:10].css`,
    }),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, 'build'),
      manifest: require('./build/vendor-manifest.json'),
    }),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new webpack.EnvironmentPlugin({
      ...process.env,
      GIT_SHA,
      API_PREFIX: API_BASE_PATH,
      STATIC_PREFIX: BASE_PATH,
    }),
  ],
  stats: {
    colors: true,
    children: false,
    modules: false,
    version: false,
    assetsSort: '!size',
    warningsFilter: [/export .* was not found in/, /'.\/locale' in/],
    excludeAssets: [/\.(hot-update|woff|eot|ttf|svg|ico|png)/],
  },
  performance: {hints: false},
}
