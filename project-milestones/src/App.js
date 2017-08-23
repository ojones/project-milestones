import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { socket, feathersClient } from './feathersClient'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { milestones: [] };
    const milestones = feathersClient.service('milestones');
    milestones.find().then( milestonesResonse => {
      const milestones = milestonesResonse.data;
      this.setState({milestones});
      console.log(this.state.milestones)
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div>
          There are {this.state.milestones.length} milestones so far :)
        </div>
      </div>
    );
  }
}

export default App;
