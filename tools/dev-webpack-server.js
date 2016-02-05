/* eslint-disable no-var, strict */
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.conf.js')('dev');

var server = new WebpackDevServer(webpack(config), {
	publicPath: config.output.publicPath,
	hot: true,
	historyApiFallback: true
});

server.app.get('/hello', function( req, res ) {
	res.send('Hello World!');
});

var l = server.app._router.stack.length;
var e = server.app._router.stack[l - 1];
server.app._router.stack.splice(l - 1, 1);
server.app._router.stack.splice(4, 0, e);

server.listen(5000, 'localhost', function (err) {
    if (err) {
      console.log(err);
    }
    console.log('Listening at localhost:3000');
});


