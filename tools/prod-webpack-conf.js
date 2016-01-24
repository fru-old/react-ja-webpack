var webpack = require('webpack');
var path = require('path');
var I18nPlugin = require("i18n-webpack-plugin");
var languages = {
	"en": null,
    "de": require("../lang/de.json")
};

process.env.NODE_ENV = "production";

module.exports = Object.keys(languages).map(function(language) {
	var languageExtension = language === 'en' ? '' : ('.' + language);
    return {
		entry: {
			bundle: './lib/index'
		},
		output: {
			path: path.join(__dirname, '../dist'),
			filename: '[name]' + languageExtension + '.js',
			publicPath: '/'
		},
		resolve: {
			extensions: ['', '.js']
		},
		devtool: 'source-map',
		plugins: [
			new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.optimize.UglifyJsPlugin({
				compress: { warnings: false }
			}),
			new webpack.DefinePlugin({
			  'process.env': {
				'NODE_ENV': JSON.stringify('production')
			  }
			}),
			new I18nPlugin(languages[language])
		],
		module: {
			loaders: [{
				test: /\.jsx?$/,
				loaders: ['babel'],
				include: path.join(__dirname, '../lib')
			},{
				test: /\.s?css$/,
				loaders: ['style-loader', 'css-loader', 'postcss-loader'],
			},{
				test: /\.html$/,
				loaders: ['react-templates-loader']
	        },{
				test: /\.json$/,
				loaders: ['json']
			}]
		},
		postcss: function plugins(bundler) {
			return [
				require('postcss-import')({ addDependencyTo: bundler }),
				require('precss')()
			];
		}
	};
});

//module.exports.push("other", {test: "test"});