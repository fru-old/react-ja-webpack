import React from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { Router, Route, IndexRoute, hashHistory  } from 'react-router'
import { Transmit } from "react-transmit";
let history = require('history/lib/createBrowserHistory')();

const About = React.createClass({
	render() {
		return (
			<div>About</div>
		)
	}
});

render(<Router history={hashHistory}>
	<Route path="/about" component={About}/>
    <Route path="/" component={App}/>
</Router>, document.getElementById('root'));