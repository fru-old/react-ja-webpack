var phantomcss = require( 'phantomcss' );
//var casper = require('casper').create();

module.exports = function (callback) {
	
	casper.test.begin( 'PhantomCss Test Harness', function ( test ) {

		phantomcss.init( {
			libraryRoot: './node_modules/phantomcss',
			cleanupComparisonImages: true
		} );
		
		casper.start();
		phantomcss.turnOffAnimations();
		
		// List of tests
		callback();
		
		casper.on( 'error', function ( err ) {
			this.echo( "PhantomJs error: " + err );
		} );
		
		casper.on( 'page.error', function ( err ) {
			this.echo( "Error: " + err );
		} );

		casper.on( 'resource.error', function ( err ) {
			casper.log( 'Load error: ' + err, 'warning' );
		} );
		
		casper.on( 'remote.message', function ( msg ) {
			this.echo( msg );
		} );
		
		casper.then( function now_check_the_screenshots() {
			phantomcss.compareAll();
		} );
		
		casper.run( function () {
			casper.test.done();
			this.exit();
		} );
		
		// Bind fallback
		// http://stackoverflow.com/questions/25359247/casperjs-bind-issue

		casper.on( 'page.initialized', function(){
			this.evaluate(function(){
				var isFunction = function(o) {
					return typeof o == 'function';
				};

				var bind,
					slice = [].slice,
					proto = Function.prototype,
					featureMap;

				featureMap = {
					'function-bind': 'bind'
				};

				function has(feature) {
					var prop = featureMap[feature];
					return isFunction(proto[prop]);
				}
				
				if (!has('function-bind')) {
					bind = function bind(obj) {
						var args = slice.call(arguments, 1),
							self = this,
							nop = function() {},
							bound = function() {
								return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
							};
						nop.prototype = this.prototype || {};
						bound.prototype = new nop();
						return bound;
					};
					proto.bind = bind;
				}
			});
		});
	});
};