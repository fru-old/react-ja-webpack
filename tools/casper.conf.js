var phantomcss = require('phantomcss');

module.exports = function(callback){
	
	casper.test.begin('PhantomCss Test Harness', function(){

		phantomcss.init({
			libraryRoot: './node_modules/phantomcss',
			cleanupComparisonImages: true
		});
		
		casper.start();
		phantomcss.turnOffAnimations();
		
		// List of tests
		callback();
		
		casper.on('error', function(error){
			this.echo('PhantomJs error: ' + error);
		});
		
		casper.on('page.error', function(error){
			this.echo('Error: ' + error);
		});

		casper.on('resource.error', function(error){
			//this.echo('Load error: ' + JSON.stringify(error), 'warning');
		});
		
		casper.on('remote.message', function(message){
			this.echo(message);
		});
		
		casper.then(function(){
			phantomcss.compareAll();
		});
		
		casper.run(function (){
			casper.test.done();
			this.exit();
		});
	});
};