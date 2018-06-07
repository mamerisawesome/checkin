import React, { Component } from 'react';
import './App.css';

function assoc(obj, k, v){
  var o = Object.assign(obj, {});
  o[k] = v;
  return o;
}

class App extends Component {

  constructor(props){
    super(props);
    this.state = JSON.parse(localStorage.getItem('state')) || {entries: {}};
  }

  save(){
    localStorage.state = JSON.stringify(this.state);
  }

  componentDidMount(){
    setInterval(this.save.bind(this), 1000);
  }

  addEntry(){

    var {project, tasks} = this.refs;

    var now = new Date();
    var date = now.toISOString().split('T')[0];
    var hour = now.getHours();
    var minute = now.getMinutes();

    var id = Date.now();
    var entry = {
      project: project.value,
      tasks: tasks.value,
      date: date,
      hour: hour,
      minute: minute,
      id: id
    };

    this.setState(assoc(this.state, 'entries', assoc(this.state.entries, id, entry)));

    project.value = null;
    tasks.value = null;

  }

  updateEntry(id, k, v){
    var entry = assoc(this.state.entries[id], k, v);
    this.setState({entries: assoc(this.state.entries, id, entry)});
  }

  deleteEntry(id){
    var entries = Object.assign(this.state.entries, {});
    delete entries[id];
    this.setState({entries: entries});
  }

  clearEntries(){
    this.setState({entries: {}});
  }

  getStartTime(entry){
    return new Date(entry.date + ' ' + entry.hour + ':' + entry.minute).getTime();
  }

  output(){
    var lines = ['checkin'];
    var entries = this.sortedEntries();
    for (var i in entries){
      if (+i === entries.length - 1) break;
      var e = entries[i];
      if (!e.project.startsWith('#')) continue;
      var duration = ((this.getStartTime(entries[+i+1]) - this.getStartTime(e)) / 3600000).toFixed(2);
      var line = ['-', duration, 'hrs', e.project, e.tasks].join(' ');
      lines.push(line);
    }
    return lines.join('\n');
  }

  handleKeyPress(e){
    if(e.which === 13){
      this.addEntry();
      this.refs.project.focus();
    }
  }

  sortedEntries(){
    return Object.values(this.state.entries).sort((x, y) => {
      return this.getStartTime(x) - this.getStartTime(y);
    });
  }

  export(){
    var target = this.refs.export;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    document.execCommand("copy");
    alert('Copied to clipboard!');
  }

  import(){
    this.setState(JSON.parse(window.prompt('Enter state here:')));
  }

  render() {
    return (
      <div>

        <h1>Checkin</h1>

        <p>
          Make sure your project starts with #. Otherwise, the activity entry is treated as non-work (break, lunch, etc.)
        </p>

        <div>
          <h3>Input</h3>
          <input ref="project" placeholder="#project / out / break / lunch / whatever" onKeyPress={e => this.handleKeyPress(e)}/>
          <input ref="tasks" placeholder="stuff, i, did (optional)" onKeyPress={e => this.handleKeyPress(e)}/>
          <span>(Press enter)</span>
        </div>

        <div>
          <h3>
            Entries
            <button onClick={e => this.clearEntries()}>
              Clear
            </button>
          </h3>
          <table>
            <tbody>
              {this.sortedEntries().map(e => {
                return (
                  <tr key={e.id}>
                    {['project', 'tasks', 'date', 'hour', 'minute'].map(field => {
                      return (
                        <td key={field}>
                          <input value={e[field]} onChange={ev => this.updateEntry(e.id, field, ev.target.value)}/>
                        </td>
                      )
                    })}
                    <td>
                      <button className="delete" onClick={_ => this.deleteEntry(e.id)}>
                        X
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h3>Output</h3>
          <textarea value={this.output()} readOnly></textarea>
        </div>

        <textarea id="export" ref="export" value={JSON.stringify(this.state)}/>
        <button onClick={e => this.export()}>Export</button>
        <button onClick={e => this.import()}>Import</button>

      </div>
    );
  }

}

export default App;
