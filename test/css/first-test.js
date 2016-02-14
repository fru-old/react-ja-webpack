var phantomcss = require( 'phantomcss' );

casper.thenOpen('http://localhost:5000/');
casper.viewport( 1024, 768 );

casper.wait(5000);
//casper.waitForSelector('h1'); 
casper.then( function () {
	phantomcss.screenshot( 'body', 'open coffee machine button2' );
} );

