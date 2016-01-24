var webpack = require('webpack');
var path = require('path');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var I18nPlugin = require("i18n-webpack-plugin");

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:5000',
    'webpack/hot/dev-server',
    './lib/index'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['', '.js']
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
	  proxy: 'http://localhost:5000/'
    }, { reload: false }),
	new I18nPlugin(null)
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: path.join(__dirname, '../lib')
      },
	  {
        test: /\.s?css$/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader'],
      },
	  {
		test: /\.html$/,
		loaders: ['react-templates-loader']
	  },
	  {
		test: /\.json$/,
		loaders: ['json']
	  }
    ]
  },
  postcss: function plugins(bundler) {
    return [
      require('postcss-import')({ addDependencyTo: bundler }),
      require('precss')()
    ];
  }
};
