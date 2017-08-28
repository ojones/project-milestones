import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { feathersClient } from './feathersClient';
import { milestoneNames } from './test/milestoneNames.js';
import { veggieDescriptions } from './test/veggieDescriptions.js';
import { animalPics } from './test/animalPics.js';
import { evidenceTypes } from './test/evidenceTypes.js';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = { milestones: [] };
    // this how you setup a client connection to server
    const milestones = feathersClient.service('milestones');
    milestones.find({
      query: {
        $limit: 100,
        $sort: {
          completion_date: 1
        }
      }
    }).then( response => {
      const milestones = response.data;
      this.setState({milestones});
    });
    // this is how code listens to server changes via websocket
    milestones.on('created', milestone => {
      this.setState({ milestones: this.state.milestones.concat([milestone])})
      // just to show it works log list milestone objects after adding one
      console.log(this.state.milestones)
    });
  }

  randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  randomEvidence() {
    let evidence = {}
    evidence[evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)]] = animalPics[Math.floor(Math.random() * animalPics.length)];
    return evidence
  }

  // this creates a new fake milestone object on server
  addTestMilestone() {
    // here we just call one method on client service instead of assigning it to "milestones" const
    // these values are all retreived from test files
    feathersClient.service('milestones').create({
      name: milestoneNames[Math.floor(Math.random() * milestoneNames.length)],
      description: veggieDescriptions[Math.floor(Math.random() * veggieDescriptions.length)],
      image: animalPics[Math.floor(Math.random() * animalPics.length)],
      completion_date: this.randomDate(new Date(2017, 9, 1), new Date()),
      completion_requirements: [
        veggieDescriptions[Math.floor(Math.random() * veggieDescriptions.length)].substr(0, 12),
        veggieDescriptions[Math.floor(Math.random() * veggieDescriptions.length)].substr(0, 12),
        veggieDescriptions[Math.floor(Math.random() * veggieDescriptions.length)].substr(0, 12)
      ],
      evidence: [
        this.randomEvidence(),
        this.randomEvidence()
      ],
      completion_status: "in progress",
      requirements_complete: [false, false, false]
    })

  }

  // this uses the feathers remove method with null parameters, which means delete all
  deleteAll() {
    feathersClient.service('milestones').remove().then(() => {
      this.setState({ milestones: [] })
    });
  }

  // small test to see if milestone has already been reviewed
  isNotReviewed(milestone) {
    return milestone.completion_status === "in progress"
  }

  // this uses the feathers remove method with null parameters, which means delete all
  updateNext() {
    if (!this.state.milestones) return
    const newStatuses = ["approved", "rejected"];
    let updated = this.state.milestones.find(this.isNotReviewed);
    if (!updated) {
      updated = this.state.milestones[0]
    }
    updated.completion_status = newStatuses[Math.floor(Math.random() * newStatuses.length)];
    updated.requirements_complete.forEach( (o, i, a) => {
      a[i] = updated.completion_status === "approved" ? true : false
    });
    const milestones = feathersClient.service('milestones')
    milestones.update(updated._id, updated).then((updatedItem) => {
      milestones.find({
        query: {
          $limit: 100,
          $sort: {
            completion_date: 1
          }
        }
      }).then( response => {
        const milestones = response.data;
        this.setState({milestones});
        // just to show it works log list milestone objects after updating one
        console.log(this.state.milestones)
      });
    });
  }

  handleAddMilestone(e) {
    this.addTestMilestone();
  }

  handleDeleteAll(e) {
    this.deleteAll();
  }

  handleUpdateNext(e) {
    this.updateNext();
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          Look at App.js to see how to connect to server to read, write, and delete.
        </p>
        <div>
          There are {this.state.milestones.length} milestones so far :)
        </div>
        <div>
          <button onClick={this.handleAddMilestone.bind(this)}>Add milestone</button>
          <button onClick={this.handleDeleteAll.bind(this)}>Delete all</button>
          <button onClick={this.handleUpdateNext.bind(this)}>Update next</button>
        </div>
        <div>
          <ul>
            {this.state.milestones.map(function(listValue){
              return <li>{listValue.name} is {listValue.completion_status}</li>;
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
