import React from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { default as table } from './table';
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

const pages = <Router history={hashHistory}>
	<Route path="/about" component={About}/>
    <Route path="/" component={App}/>
</Router>;

render(table, document.getElementById('root'));