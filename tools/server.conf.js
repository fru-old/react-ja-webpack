module.exports = function init(app){
	
	app.get('/hello', function( req, res ) {
		res.send('Hello World!');
	});
	
};