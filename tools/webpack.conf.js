var I18nPlugin = require('i18n-webpack-plugin');
var webpack = require('webpack');
var path = require('path');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var proxyquire = require('proxyquire');
var Express = require('express');

/**
 * Register languages and there translation json here
 */
var languages = {
	'en': null,
	'de': require('../lang/de.json')
};

/**
 * Builds the webpack options. 
 */
function options(babelPlugins, webpackPlugins, postLoaders, reloadEntries, language, devtool, output){
	
	var babel = {
		presets: ['react', 'es2015', 'stage-0'],
		plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals'].concat(babelPlugins)
	};
	
	return {
		server: require('./server.conf.js'),
		webpack: {
			entry: {
				bundle: [
					'es5-shim', 
					'es5-shim/es5-sham',
					'console-polyfill',
					'./lib/index'
				].concat(reloadEntries)
			},
			resolve: {
				extensions: ['', '.js']
			},
			module: {
				loaders: [{
					test: /\.s?css$/,
					loaders: ['style-loader', 'css-loader', 'postcss-loader'],
				},{
					test: /\.html$/,
					loaders: ['react-templates-loader']
				},{
					test: /\.json$/,
					loaders: ['json']
				},{
					test: /\.jsx?$/,
					loaders: ['es3ify']
				},{
					test: /\.jsx?$/,
					loaders: ['babel?'+JSON.stringify(babel)],
					include: [path.join(__dirname, '../lib'), path.join(__dirname, '../test')]
				}],
				postLoaders: postLoaders
			},
			postcss: function plugins(bundler) {
				return [
					require('postcss-import')({ addDependencyTo: bundler }),
					require('precss')()
				];
			},
			plugins: [new I18nPlugin(languages[language])].concat(webpackPlugins),
			devtool: devtool,
			output: output
		}
	};
}

/**
 * Extends the webpack options depending on the target. 
 */
function buildConfig(target, language, devtool, output){
		
	var babelPlugins = [], webpackPlugins = [], postLoaders = [], reloadEntries = [];
		
	if(target === 'dev'){
		
		babelPlugins = [
			'transform-runtime', [ 'react-transform', {
				transforms: [{
					transform : 'react-transform-hmr',
					imports : ['react'],
					locals : ['module']
				}]
			}]
		];
		webpackPlugins = [
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoErrorsPlugin(),
			new BrowserSyncPlugin({
				host: 'localhost',
				port: 3000,
				proxy: 'http://localhost:5000/'
			}, { reload: false })
		];
		reloadEntries = [
			'webpack-dev-server/client?http://localhost:5000',
			'webpack/hot/dev-server',
			'./node_modules/phantomjs-polyfill/bind-polyfill.js'
		];
		
	}else if(target === 'test'){
		
		postLoaders = [{
			test: /\.jsx?/,
			exclude: /(test|node_modules|bower_components)/,
			loader: 'istanbul-instrumenter'
		}];
		
	}else if(target === 'prod'){
		
		webpackPlugins = [
			new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.optimize.UglifyJsPlugin({
				compress: { warnings: false }
			}),
			new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('production')
				}
			})
		];
	}
	return options(babelPlugins, webpackPlugins, postLoaders, reloadEntries, language, devtool, output); 
}

/**
 * Execute or return webpack configuration
 */
module.exports = function(target){
	
	if(target === 'dev'){
		
		var config = buildConfig(target, options, 'eval-source-map', {
			path: __dirname,
			filename: '[name].js',
			publicPath: '/dist/'
		});

		// Mock express and insert dev server
		
		var WebpackDevServer = proxyquire('webpack-dev-server', { 'express': function(){
			return config.server(new Express());
		}});

		var server = new WebpackDevServer(webpack(config.webpack), {
			publicPath: config.webpack.output.publicPath,
			hot: true,
			historyApiFallback: true
		});
		
		server.listen(5000, 'localhost', function (error) {
			console.log(error || 'Listening at localhost:3000');
		});

	}else if(target === 'test'){
		
		return buildConfig(target, options, 'eval-source-map').webpack;
		
	}else if(target === 'prod'){
		
		var languageWebpackConfig = Object.keys(languages).map(function(language){
			
			var extension = (language === 'en' ? '' : ('.' + language)) + '.js';
			
			return buildConfig(target, language, 'source-map', {
				path: path.join(__dirname, '../dist'),
				filename: '[name]' + extension,
				publicPath: '/'
			}).webpack;
		});
		
		webpack(languageWebpackConfig).run(function(err, stats){
			process.stdout.write(stats.toString({ 
				colors: { level: 1, hasBasic: true },
				chunks: false
			}));
			process.exit(0);
		});
	}
};