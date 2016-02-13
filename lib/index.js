import React from 'react';
import { render } from 'react-dom';
import { default as Infinite } from 'react-infinite';

var ListItem = React.createClass({
    render: function() {
        return <div className="infinite-list-item" style={{height: "40px"}}>
        List Item {this.props.num}
        </div>;
    }
});

var InfiniteList = React.createClass({
    getInitialState: function() {
        return {
            elements: this.buildElements(0, 50),
            isInfiniteLoading: false
        }
    },

    buildElements: function(start, end) {
        var elements = [];
        for (var i = start; i < end; i++) {
            elements.push(<ListItem key={i} num={i}/>)
        }
        return elements;
    },

    handleInfiniteLoad: function() {
        var that = this;
        this.setState({
            isInfiniteLoading: true
        });
        setTimeout(function() {
            var elemLength = that.state.elements.length,
                newElements = that.buildElements(elemLength, elemLength + 1000);
            that.setState({
                isInfiniteLoading: false,
                elements: that.state.elements.concat(newElements)
            });
        }, 2500);
    },

    elementInfiniteLoad: function() {
        return <div className="infinite-list-item">
            Loading...
        </div>;
    },

    render: function() {
        return <Infinite elementHeight={40}
                         containerHeight={250}
                         infiniteLoadBeginEdgeOffset={200}
                         onInfiniteLoad={this.handleInfiniteLoad}
                         loadingSpinnerDelegate={this.elementInfiniteLoad()}
                         isInfiniteLoading={this.state.isInfiniteLoading}
                         >
            {this.state.elements}
        </Infinite>;
    }
});

render(<InfiniteList/>, document.getElementById('root'));