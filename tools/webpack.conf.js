var webpack = require('webpack');
var path = require('path');
var I18nPlugin = require("i18n-webpack-plugin");
var languages = {
	"en": null,
    "de": require("../lang/de.json")
};

process.env.NODE_ENV = "production";

var config = Object.keys(languages).map(function(language) {
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

var compiler = webpack(config);


compiler.run(function(err, stats) {
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




//module.exports.push("other", {test: "test"});