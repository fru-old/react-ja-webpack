
var I18nPlugin = require('i18n-webpack-plugin');
var webpack = require('webpack');
var path = require('path');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

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
function options( babelPlugins, webpackPlugins, postLoaders, reloadEntries, language ) {
	
	var babel = {
		presets: ['react', 'es2015', 'stage-0'],
		plugins: babelPlugins
	};
	
	return {
		server: require('./server.conf.js'),
		webpack: {
			entry: {
				bundle: ['./lib/index'].concat(reloadEntries)
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
				}, {
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
			plugins: [new I18nPlugin(languages[language])].concat(webpackPlugins)
		}
	};
}

/**
 * Extends the webpack options depending on the target. 
 */
function buildConfig(target, language) {
		
	if(target === 'dev'){
		
		var babelPlugins = [
			'transform-runtime', [ 'react-transform', {
				transforms: [{
					transform : 'react-transform-hmr',
					imports : ['react'],
					locals : ['module']
				}]
			}]
		];
		var webpackPlugins = [
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoErrorsPlugin(),
			new BrowserSyncPlugin({
				host: 'localhost',
				port: 3000,
				proxy: 'http://localhost:5000/'
			}, { reload: false })
		];
		var reloadEntries = [
			'webpack-dev-server/client?http://localhost:5000',
			'webpack/hot/dev-server'
		];
		
		return options(babelPlugins, webpackPlugins, [], reloadEntries, language); 
		
	}else if(target === 'test'){
		
		var postLoaders = [{
			test: /\.jsx?/,
			exclude: /(test|node_modules|bower_components)/,
			loader: 'istanbul-instrumenter'
		}];
		
		return options([], [], postLoaders, [], language); 
		
	}else if(target === 'prod'){
		
		var webpackPlugins = [
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
		
		return options([], webpackPlugins, [], [], language);
	}
}

/**
 * Execute or return webpack configuration
 */
module.exports = function(target){
	
	if(target === 'dev'){
		
		var config = buildConfig(target, options);

		config.webpack.output = {
			path: __dirname,
			filename: '[name].js',
			publicPath: '/dist/'
		};
		config.webpack.devtool = 'eval-source-map';

		// Mock express and insert dev server
		
		var proxyquire =  require('proxyquire');
		var Express =  require('express');
		var app = new Express();
		var WebpackDevServer = proxyquire('webpack-dev-server', { 'express': function(){
			config.server(app);
			return app;
		}});

		var server = new WebpackDevServer(webpack(config.webpack), {
			publicPath: config.webpack.output.publicPath,
			hot: true,
			historyApiFallback: true
		});
		
		server.listen(5000, 'localhost', function (err) {
			if (err) {
			  console.log(err);
			}
			console.log('Listening at localhost:3000');
		});

	}else if(target === 'test'){
		
		var config = buildConfig(target, options);
		config.webpack.devtool = 'eval-source-map';
		
		return config.webpack;
		
	}else if(target === 'prod'){
		
		var languageWebpackConfig = Object.keys(languages).map(function(language) {
			
			var extension = (language === 'en' ? '' : ('.' + language)) + '.js';
			var config = buildConfig(target, language);
			
			config.webpack.devtool = 'source-map';
			
			config.webpack.output = {
				path: path.join(__dirname, '../dist'),
				filename: '[name]' + extension,
				publicPath: '/'
			};
			return config.webpack;
		});
		
		webpack(languageWebpackConfig).run(function(err, stats) {
			process.stdout.write(stats.toString({ 
				context: undefined,
				colors: { level: 1, hasBasic: true, has256: false, has16m: false },
				cached: false,
				cachedAssets: false,
				modules: true,
				chunks: false,
				reasons: false,
				errorDetails: false,
				chunkOrigins: false,
				exclude: [ 'node_modules', 'bower_components', 'jam', 'components' ] 
			}) + '\n');
	
			process.exit(0);
		});
	}
};