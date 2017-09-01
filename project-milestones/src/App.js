import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { feathersClient } from './feathersClient';
import { milestoneNames } from './test/milestoneNames.js';
import { giverNames } from './test/first_last_names.js';
import { veggieDescriptions } from './test/veggieDescriptions.js';
import { animalPics } from './test/animalPics.js';
import { evidenceTypes } from './test/evidenceTypes.js';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = { milestones: [], givers: [] };

    // set state for milestones
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

    // set state for givers
    // this how you setup a client connection to server
    const givers = feathersClient.service('givers');
    givers.find({
      query: {
        $limit: 100,
        $sort: {
          name: 1
        }
      }
    }).then( response => {
      const givers = response.data;
      this.setState({givers});
    });
    // this is how code listens to server changes via websocket
    givers.on('created', giver => {
      this.setState({ givers: this.state.givers.concat([giver])})
      // just to show it works log list giver objects after adding one
      console.log(this.state.givers)
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

  // this creates a new fake giver object on server
  addTestGiver() {
    // here we just call one method on client service instead of assigning it to "givers" const
    // these values are all retreived from test files
    feathersClient.service('givers').create({
      name: giverNames[Math.floor(Math.random() * giverNames.length)]
    })
  }

  // this uses the feathers remove method with null parameters, which means delete all
  deleteAllMilestones() {
    feathersClient.service('milestones').remove().then(() => {
      this.setState({ milestones: [] })
    });
  }

  deleteAllGivers() {
    feathersClient.service('givers').remove().then(() => {
      this.setState({ givers: [] })
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
    const campaigns = feathersClient.service('campaigns')
    campaigns.update(updated._id, updated).then((updatedItem) => {
      campaigns.find({
        query: {
          $limit: 100,
          $sort: {
            completion_date: 1
          }
        }
      }).then( response => {
        const campaigns = response.data;
        this.setState({campaigns});
        // just to show it works log list milestone objects after updating one
        console.log(this.state.campaigns)
      });
    });
  }

  handleAddMilestone(e) {
    this.addTestMilestone();
  }

  handleDeleteAllMilestones(e) {
    this.deleteAllMilestones();
  }

  handleUpdateNext(e) {
    this.updateNext();
  }

  handleAddGiver(e) {
    this.addTestGiver();
  }

  handleDeleteAllGivers(e) {
    this.deleteAllGivers();
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
          There are {this.state.givers.length} givers so far :)
        </div>
        <div>
          <button onClick={this.handleAddGiver.bind(this)}>Add giver</button>
          <button onClick={this.handleDeleteAllGivers.bind(this)}>Delete givers</button>
        </div>
        <div>
          <ul>
            {this.state.givers.map(function(listValue){
              return <li>{listValue.name}</li>;
            })}
          </ul>
        </div>
        <div>
          There are {this.state.milestones.length} milestones so far :)
        </div>
        <div>
          <button onClick={this.handleAddMilestone.bind(this)}>Add milestone</button>
          <button onClick={this.handleDeleteAllMilestones.bind(this)}>Delete milestones</button>
          <button onClick={this.handleUpdateNext.bind(this)}>Update next milestone</button>
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
