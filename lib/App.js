import React, { Component } from 'react';
import { NICE, SUPER_NICE } from './colors';

require('./merge.scss');

var JadeTitleComponent = React.createClass({
    render: require('./title.html')
});

console.log(require('./test.json'));

var Counter = React.createClass({
	getInitialState: function() {
		return { counter: 1 };
	},
	tick: function() {
		this.setState({
			counter: this.state.counter + this.props.increment
		});
	},
	clear: function(event) {
		this.setState({
			counter: 100
		});
	},
	componentDidMount: function() {
		this.interval = setInterval(() => this.tick(), 1000);
	},
	componentWillUnmount: function() {
		clearInterval(this.interval);
	},
	render: function() {
		return (
		  <h1 style={{ color: this.props.color }}>
			<span>({__("Counter")} {this.props.increment}): {this.state.counter}</span>
			<button onClick={this.clear}>{__("Set to 10")}</button> 
		  </h1>
		);
	}
});

export class App extends Component {
  render() {
    return (
      <div>
	    <JadeTitleComponent title="Test" />
        <Counter increment={10} color={NICE} />
        <Counter increment={5} color={SUPER_NICE} />
      </div>
    );
  }
}