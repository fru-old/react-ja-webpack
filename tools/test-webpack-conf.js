var webpack = require('webpack');
var path = require('path');
var I18nPlugin = require("i18n-webpack-plugin");

process.env.NODE_ENV = "production";

module.exports = {
	module: {
		loaders: [{ 
			test: /\.jsx?$/,
			loaders: ['babel'],
			include: [path.join(__dirname, '../lib'), path.join(__dirname, '../test')]
		},{
			test: /\.s?css$/,
			loaders: ['style-loader', 'css-loader', 'postcss-loader'],
		},{
			test: /\.html$/,
			loaders: ['react-templates-loader']
		},{
			test: /\.json$/,
			loaders: ['json']
	    }],
		postLoaders: [{
			test: /\.jsx?/,
			exclude: /(test|node_modules|bower_components)/,
			loader: 'istanbul-instrumenter'
		}]
	},
	devtool: 'eval-source-map',
	plugins: [
		new I18nPlugin(null)
	],
	postcss: function plugins(bundler) {
		return [
			require('postcss-import')({ addDependencyTo: bundler }),
			require('precss')()
		];
	}
};
