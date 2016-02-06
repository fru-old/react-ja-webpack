// TODO Test path changes in options
// TODO Make functions overrideable

module.exports = function(stage, options){
	
	var webpack = require('webpack');
	var path = require('path');
	var I18nPlugin = require("i18n-webpack-plugin");
	var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

	function addBabelLoader(stage, options, webpackConfig, babelConfig, currentLanguage) {
		
		babelConfig.presets.push('react');
		if(stage === 'dev'){
			babelConfig.plugins = [
				'transform-runtime', [ 'react-transform', {
					transforms: [{
						transform : 'react-transform-hmr',
						imports : ['react'],
						locals : ['module']
					}]
				}]
			];			
		}
		
		webpackConfig.module.loaders.push({
			test: /\.jsx?$/,
			loaders: ['babel?'+JSON.stringify(babelConfig)],
			include: [path.join(__dirname, options.libraryPath), path.join(__dirname, options.testPath)]
		});
		
		if(stage === 'test'){
			webpackConfig.module.postLoaders = webpackConfig.module.postLoaders || [];
			webpackConfig.module.postLoaders.push({
				test: /\.jsx?/,
				exclude: /(test|node_modules|bower_components)/,
				loader: 'istanbul-instrumenter'
			});
		}
	}

	function addWebpackPlugins(stage, options, webpackConfig, babelConfig, currentLanguage) {
		
		webpackConfig.plugins = webpackConfig.plugins || [];
		
		if(stage === 'dev'){
			
			webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
			webpackConfig.plugins.push(new webpack.NoErrorsPlugin());
			webpackConfig.plugins.push(new BrowserSyncPlugin({
				host: 'localhost',
				port: 3000,
				proxy: 'http://localhost:5000/'
			}, { reload: false }));
			webpackConfig.plugins.push(new I18nPlugin(null));
			
		}else if(stage === 'test'){
			
			webpackConfig.plugins.push(new I18nPlugin(null));
			
		}else if(stage === 'prod'){
			
			webpackConfig.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
			webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
				compress: { warnings: false }
			}));
			webpackConfig.plugins.push(new webpack.DefinePlugin({
				'process.env': {
					'NODE_ENV': JSON.stringify('production')
				}
			}));
			webpackConfig.plugins.push(new I18nPlugin(options.languages[currentLanguage]));
		}
	}

	function addWebpackEntries(stage, options, webpackConfig, babelConfig, currentLanguage){
		
		if(stage === 'dev'){
			
			var firstKey;
			for (firstKey in webpackConfig.entry) break;
			
			if(!firstKey){
				firstKey = 'bundle';
				webpackConfig.entry.bundle = './lib/index';
			}
			
			if(typeof webpackConfig.entry[firstKey] === 'string'){
				webpackConfig.entry[firstKey] = [webpackConfig.entry[firstKey]];
			}
			webpackConfig.entry[firstKey].push('webpack-dev-server/client?http://localhost:' + options.reloadPort);
			webpackConfig.entry[firstKey].push('webpack/hot/dev-server');
		}
	}

	function buildConfig(stage, options, currentLanguage) {
		
		var webpackConfig = options.webpack(stage);
		var babelConfig = options.babel(stage);
		
		addBabelLoader(stage, options, webpackConfig, babelConfig, currentLanguage);
		addWebpackPlugins(stage, options, webpackConfig, babelConfig, currentLanguage);
		addWebpackEntries(stage, options, webpackConfig, babelConfig, currentLanguage);
		
		return webpackConfig;
	}	
	
	if(stage === 'dev'){
		
		var result = buildConfig(stage, options);
		result.output = {
			path: __dirname,
			filename: '[name].js',
			publicPath: '/dist/'
		};
		result.devtool = 'eval-source-map';
		
		var webpack = require('webpack');
		var proxyquire =  require('proxyquire');
		var Express =  require('express');
		var app = new Express();
		var WebpackDevServer = proxyquire('webpack-dev-server', { 'express': function(){
			options.server(app);
			return app;
		}});

		var server = new WebpackDevServer(webpack(result), {
			publicPath: result.output.publicPath,
			hot: true,
			historyApiFallback: true
		});
		
		server.listen(5000, 'localhost', function (err) {
			if (err) {
			  console.log(err);
			}
			console.log('Listening at localhost:3000');
		});

	}else if(stage === 'test'){
		
		var result = buildConfig(stage, options);
		result.devtool = 'eval-source-map';
		
		return result;
		
	}else if(stage === 'prod'){
		
		var languageWebpackConfig = Object.keys(options.languages).map(function(language) {
			
			var extension = (language === 'en' ? '' : ('.' + language)) + '.js';
			var result = buildConfig(stage, options, language);
			
			result.devtool = 'source-map';
			
			result.output = {
				path: path.join(__dirname, '../dist'),
				filename: '[name]' + extension,
				publicPath: '/'
			};
			return result;
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
			}) + "\n");
	
			process.exit(0);
		});
	}
};