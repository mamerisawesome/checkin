import React, { Component } from 'react'
import './App.css'

function assoc (obj, k, v) {
  var o = Object.assign(obj, {})
  o[k] = v
  return o
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = JSON.parse(localStorage.getItem('state')) || {entries: {}, goals: {}}
    this.state.goals = this.state.goals || {}
    this.state.now = new Date()
    setInterval(_ => this.tick(), 100)
  }

  tick () {
    this.setState({now: new Date()})
  }

  save () {
    localStorage.state = JSON.stringify(this.state)
  }

  componentDidMount () {
    setInterval(this.save.bind(this), 1000)
  }

  addEntry () {
    var {project, tasks} = this.refs

    var now = this.state.now
    var date = now.toISOString().split('T')[0]
    var hour = now.getHours()
    var minute = now.getMinutes()

    var id = Date.now()
    var entry = {
      project: project.value,
      tasks: tasks.value,
      date: date,
      hour: hour,
      minute: minute,
      id: id
    }

    this.setState(assoc(this.state, 'entries', assoc(this.state.entries, id, entry)))

    project.value = null
    tasks.value = null
  }

  addGoal () {
    var {goalProject, goalTasks, goalHours} = this.refs

    var id = Date.now()
    var goal = {
      project: goalProject.value,
      tasks: goalTasks.value,
      hours: goalHours.value,
      id: id
    }

    this.setState(assoc(this.state, 'goals', assoc(this.state.goals, id, goal)))

    goalProject.value = null
    goalTasks.value = null
    goalHours.value = null
  }

  updateEntry (id, k, v) {
    var entry = assoc(this.state.entries[id], k, v)
    this.setState({entries: assoc(this.state.entries, id, entry)})
  }

  updateGoal (id, k, v) {
    var goal = assoc(this.state.goals[id], k, v)
    this.setState({goals: assoc(this.state.goals, id, goal)})
  }

  deleteEntry (id) {
    var entries = Object.assign(this.state.entries, {})
    delete entries[id]
    this.setState({entries: entries})
  }

  deleteGoal (id) {
    var goals = Object.assign(this.state.goals, {})
    delete goals[id]
    this.setState({goals: goals})
  }

  clearEntries () {
    if (window.confirm('Are you sure you want to clear all entries? You cannot undo this!')) {
      this.setState({entries: {}})
    }
  }

  clearGoals () {
    if (window.confirm('Are you sure you want to clear all goals? You cannot undo this!')) {
      this.setState({goals: {}})
    }
  }

  getStartTime (entry) {
    return new Date(entry.date + ' ' + entry.hour + ':' + entry.minute).getTime()
  }

  output () {
    var lines = ['checkin']
    var entries = this.sortedEntries()
    for (var i in entries) {
      if (+i === entries.length - 1) break
      var e = entries[i]
      if (!this.isLogged(e)) continue
      var duration = ((this.getStartTime(entries[+i + 1]) - this.getStartTime(e)) / 3600000).toFixed(2)
      var line = ['-', duration, 'hrs', e.project, e.tasks].join(' ')
      lines.push(line)
    }
    return lines.join('\n')
  }

  todayteString () {
    return new Date().toISOString().split('T')[0]
  }

  goalOutput () {
    var lines = ['goals ' + this.todayteString()]
    var goals = this.sortedGoals()
    for (var i in goals) {
      var g = goals[i]
      var line = ['-', g.hours, 'hrs', '#' + g.project, g.tasks].join(' ')
      lines.push(line)
    }
    return lines.join('\n')
  }

  handleCheckinKeyPress (e) {
    if (e.which === 13) {
      this.addEntry()
      this.refs.project.focus()
    }
  }

  handleGoalKeyPress (e) {
    if (e.which === 13) {
      this.addGoal()
      this.refs.goalProject.focus()
    }
  }

  sortedEntries () {
    return Object.values(this.state.entries).sort((x, y) => {
      return this.getStartTime(x) - this.getStartTime(y)
    })
  }

  sortedGoals () {
    return Object.values(this.state.goals).sort((x, y) => {
      return y.hours - x.hours
    })
  }

  export () {
    var target = this.refs.export
    target.focus()
    target.setSelectionRange(0, target.value.length)
    document.execCommand('copy')
    alert('Copied to clipboard!')
  }

  import () {
    this.setState(JSON.parse(window.prompt('Enter state here:')))
  }

  isLogged (entry) {
    return entry && entry.project.startsWith('#')
  }

  totalHours () {
    var total = 0
    var entries = this.sortedEntries()
    for (var i in entries) {
      if (+i === entries.length - 1) break
      var e = entries[i]
      if (!this.isLogged(e)) continue
      total += (this.getStartTime(entries[+i + 1]) - this.getStartTime(e)) / 3600000
    }
    return total
  }

  pendingHours () {
    var lastEntry = this.sortedEntries().pop()
    if (this.isLogged(lastEntry)) {
      return (this.state.now.getTime() - this.getStartTime(lastEntry)) / 3600000
    } else {
      return 0
    }
  }

  runningHours () {
    return this.totalHours() + this.pendingHours()
  }

  targetMet () {
    var met = this.runningHours() >= 8
    if (this.state.met !== met) {
      this.setState({met})
      if (met) this.celebrate()
    }
    return met
  }

  celebrate () {
    (new Audio('http://syk0saje.com/junk/alvot/audio/annyeong.mp3')).play()
    // alert("You've logged 8 hours today! \\o/ Go buy some drugs!");
  }

  goalHours () {
    return this.sortedGoals().map(x => parseFloat(x.hours)).reduce((x, y) => x + y, 0)
  }

  render () {
    return (
      <div>

        <h1>Checkin</h1>

        <p>
          Make sure your project starts with #. Otherwise, the activity entry is treated as non-work (break, lunch, etc.)
        </p>

        <div>
          <h3>Input</h3>
          <input ref='project' placeholder='#project / out / break / lunch / whatever' onKeyPress={e => this.handleCheckinKeyPress(e)} />
          <input ref='tasks' placeholder='stuff, i, did (optional)' onKeyPress={e => this.handleCheckinKeyPress(e)} />
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
                          <input value={e[field]} onChange={ev => this.updateEntry(e.id, field, ev.target.value)} />
                        </td>
                      )
                    })}
                    <td>
                      <button className='delete' onClick={_ => this.deleteEntry(e.id)}>
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
          <h3>
            Output [{this.totalHours().toFixed(2)} hrs total
            going on <span style={{color: this.targetMet() ? 'green' : '#000'}}>{this.runningHours().toFixed(4)}</span>]
          </h3>
          <textarea value={this.output()} readOnly />
        </div>

        <textarea id='export' ref='export' value={JSON.stringify(this.state)} readOnly />
        <button onClick={e => this.export()}>Export</button>
        <button onClick={e => this.import()}>Import</button>

        {
          this.state.met
            ? <iframe title='drugz' width='560' height='315' src='https://www.youtube.com/embed/RXQCrOEx1-g?start=30&autoplay=1' frameborder='0' allow='autoplay; encrypted-media' allowfullscreen />
            : null
        }

        <h1>Weekly Goals</h1>

        <div>
          <h3>Input</h3>
          <input ref='goalProject' placeholder='project without the # (e.g. opsandadmin)' onKeyPress={e => this.handleGoalKeyPress(e)} />
          <input ref='goalTasks' placeholder='stuff, i, did (optional)' onKeyPress={e => this.handleGoalKeyPress(e)} />
          <input ref='goalHours' placeholder='hours (e.g. 5, 10)' onKeyPress={e => this.handleGoalKeyPress(e)} />
          <span>(Press enter)</span>
        </div>

        <div>
          <h3>
            Goals
            <button onClick={e => this.clearGoals()}>
              Clear
            </button>
          </h3>
          <table>
            <tbody>
              {this.sortedGoals().map(e => {
                return (
                  <tr key={e.id}>
                    {['project', 'tasks', 'hours'].map(field => {
                      return (
                        <td key={field}>
                          <input value={e[field]} onChange={ev => this.updateGoal(e.id, field, ev.target.value)} />
                        </td>
                      )
                    })}
                    <td>
                      <button className='delete' onClick={_ => this.deleteGoal(e.id)}>
                        X
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div>
            <h3>
              Output
              [<span style={{color: this.goalHours() >= 40 ? 'green' : '#000'}}>{this.goalHours()}</span> hrs total]
            </h3>
            <textarea value={this.goalOutput()} readOnly />
          </div>
        </div>

      </div>
    )
  }
}

export default App
