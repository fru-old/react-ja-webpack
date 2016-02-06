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
		
		require('react-ja-webpack-reusable/casper-bind-fallback.js')(casper);
	});
	
};