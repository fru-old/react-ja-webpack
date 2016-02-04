
// Here the project options can be changed to fit your needs
var options = {
	libraryPath: '../lib',
	testPath: '../test',
	outputPath: '../dist',
	publicPath: '/dist/', // same as output path
	port: 3000,
	reloadPort: 5000
};

// Used by the i18n plugin to build translated bundles 
var languages = {
	'en': null,
	'de': require('../lang/de.json')
};

// A basic webpack configuration that is later automatically extended 
var webpackConfigFactory = function(stage) { 
	return {
		entry: {
			bundle: './lib/index'
		},
		resolve: {
			extensions: ['', '.js']
		},
		module: {
			// A babel js loader is automatically added later
			loaders: [{
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
};

// A babel configuration which is also extended later
var babelConfigFactory = function(stage) { 
	return {
		presets: ['es2015', 'stage-0']
	};
};


// The folowing can be extracted

var webpack = require('webpack');
var path = require('path');
var I18nPlugin = require("i18n-webpack-plugin");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

function addBabelLoader(stage, options, languages, webpackConfig, babelConfig, currentLanguage) {
	
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
}

function addWebpackPlugins(stage, options, languages, webpackConfig, babelConfig, currentLanguage) {
	
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
		webpackConfig.plugins.push(new I18nPlugin(languages[currentLanguage]));
	}
}

function addWebpackEntries(stage, options, languages, webpackConfig, babelConfig, currentLanguage){
	
	if(stage === 'dev'){
		// Todo solve properly (add to first???)
		webpackConfig.entry = { bundle: [
			'webpack-dev-server/client?http://localhost:5000',
			'webpack/hot/dev-server',
			'./lib/index'
		] };
	}
}

function buildConfig(stage, options, languages, webpackConfigFactory, babelConfigFactory, currentLanguage) {
	
	var webpackConfig = webpackConfigFactory(stage);
	var babelConfig = babelConfigFactory(stage);
	
	addBabelLoader(stage, options, languages, webpackConfig, babelConfig, currentLanguage);
	addWebpackPlugins(stage, options, languages, webpackConfig, babelConfig, currentLanguage);
	addWebpackEntries(stage, options, languages, webpackConfig, babelConfig, currentLanguage);
	
	return webpackConfig;
}



module.exports = function(stage){
	
	if(stage === 'dev'){
		
		var result = buildConfig(stage, options, languages, webpackConfigFactory, babelConfigFactory);
		
		// TODO make extensible
		
		result.output = {
			path: __dirname,
			filename: '[name].js',
			publicPath: options.publicPath
		};
		
		result.devtool = 'eval-source-map';
		
		return result;
		
	}else if(stage === 'prod'){
		
		var languageWebpackConfig = Object.keys(languages).map(function(language) {
			
			var extension = (language === 'en' ? '' : ('.' + language)) + '.js';
			var result = buildConfig(stage, options, languages, webpackConfigFactory, babelConfigFactory, language);
			
			result.output = {
				path: path.join(__dirname, options.outputPath),
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