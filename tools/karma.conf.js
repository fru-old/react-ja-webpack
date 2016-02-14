module.exports = function(config) {
	config.set({
		files: [
			'../node_modules/phantomjs-polyfill/bind-polyfill.js',
			'../test/mocha.js'
		],
		frameworks: ['mocha'],
		preprocessors: {
			'../test/mocha.js': ['webpack']
		},
		reporters: ['spec', 'coverage'],
		coverageReporter: {
			type: 'html',
			dir: '../dist/coverage/'
		},
		webpack: require('./webpack.conf.js')('test'),
		webpackMiddleware: {
			noInfo: true
		},
		plugins: [
			require('karma-webpack'),
			require('istanbul-instrumenter-loader'),
			require('karma-mocha'),
			require('karma-coverage'),
			require('karma-phantomjs-launcher'),
			require('karma-spec-reporter')
		],
		browsers: ['PhantomJS']
	});
};