const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const autoprefixer = require('autoprefixer');

const production = (process.env.NODE_ENV === 'production');

const config = {
  watch: production ? false : true,
  cache: true,
  devtool: 'inline-sourcemap',

  devServer: {
    contentBase: './src',
  },

  node: {
    global: false,
  },

  entry: {
    index: [
      path.join(__dirname, './src/index.js'),
      path.join(__dirname, './src/index.scss'),
    ],
  },

  resolve: {
    modules: [
      path.resolve(__dirname, './src/js'),
      path.resolve(__dirname, './src/sass'),
      path.resolve(__dirname, './src/data'),
      path.resolve(__dirname, './src/typefaces'),
      'node_modules',
    ]
  },

  output: {
    path: path.join(__dirname, './src'),
    publicPath: './src',
    filename: './[name].min.js',
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {},
    }, {
      test: /\.(css|sass|scss)$/,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        use: [(production) ? {
          loader: 'css-loader',
          options: {
            minimize: true
          }
        } : 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: () => [autoprefixer()]
          }
        }, 'sass-loader']
      }),
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader', {
        loader: 'postcss-loader',
        options: {
          plugins: () => [autoprefixer()]
        }
      }]
    }, {
      test: /\.(png|otf|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=100000'
    }],
  },

  plugins: production ? [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
        },
      },
    }),
    new ExtractTextPlugin({
      filename: './index.min.css',
      allChunks: true,
    }),
  ] : [
    new ExtractTextPlugin({
      filename: './index.min.css',
      allChunks: true,
    }),
  ],
};


module.exports = config;
