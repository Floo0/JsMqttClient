// index.js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'styled-bootstrap-components';


class App extends Component {
    constructor(props) {
        super(props)
        this.handleClick = this.handleClick.bind(this)
        this.state = {
            bt: "Hello World"
        }
    }

    componentDidMount() {
        console.log("index componentDidMount");
      }

    componentDidUpdate() {
        console.log("index componentDidUpdate");
    }

    componentWillUnmount() {
        console.log("index componentWillUnmount");
     }

     handleClick() {
        this.setState({
            bt: "Good Morning"
          })
     }

    render() {
        console.log("render")
        return <div>

            <Button onClick={this.handleClick}>{this.state.bt}</Button>
        </div>
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);