import React, { Component } from 'react'
import './App.css'

function assoc (obj, k, v) {
  var o = Object.assign(obj, {})
  o[k] = v
  return o
}

class App extends Component {

  adjustForTimezone(date:Date):Date {
    var timeOffsetInMS:number = date.getTimezoneOffset() * 60000;
    date.setTime(date.getTime() - timeOffsetInMS);
    return date
  }

  constructor (props) {
    super(props)
    this.state = JSON.parse(localStorage.getItem('state')) || {entries: {}}
    this.state.now = this.getNow()
    setInterval(_ => this.tick(), 100)
  }

  getNow(){
    return this.adjustForTimezone(new Date())
  }

  tick () {
    this.setState({now: this.getNow()})
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
    var [date, time] = now.toISOString().split('T')
    var [hour, minute] = time.split(':')

    var id = Date.now()
    var entry = {
      project: project.value,
      tasks: tasks.value,
      date,
      hour,
      minute,
      id
    }

    this.setState(assoc(this.state, 'entries', assoc(this.state.entries, id, entry)))

    project.value = null
    tasks.value = null
  }

  updateEntry (id, k, v) {
    var entry = assoc(this.state.entries[id], k, v)
    this.setState({entries: assoc(this.state.entries, id, entry)})
  }

  deleteEntry (id) {
    var entries = Object.assign(this.state.entries, {})
    delete entries[id]
    this.setState({entries: entries})
  }

  clearEntries () {
    if (window.confirm('Are you sure you want to clear all entries? You cannot undo this!')) {
      this.setState({entries: {}})
    }
  }

  getStartTime (entry) {
    return this.adjustForTimezone(new Date(entry.date + ' ' + entry.hour + ':' + entry.minute)).getTime()
  }

  output () {
    const lines = []
    const entries = this.sortedEntries()
    const date = entries.length ? entries[0].date : ''
    const header = `checkin ${date}`
    lines.push(header)
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

  handleKeyPress (e) {
    if (e.which === 13) {
      this.addEntry()
      this.refs.project.focus()
    }
  }

  sortedEntries () {
    return Object.values(this.state.entries).sort((x, y) => {
      return this.getStartTime(x) - this.getStartTime(y)
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
    (new Audio('https://syk0saje.gitlab.io/junk/alvot/audio/annyeong.mp3')).play()
    // alert("You've logged 8 hours today! \\o/ Go buy some drugs!");
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
          <input ref='project' placeholder='#project / out / break / lunch / whatever' onKeyPress={e => this.handleKeyPress(e)} />
          <input ref='tasks' placeholder='stuff, i, did (optional)' onKeyPress={e => this.handleKeyPress(e)} />
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
          this.targetMet()
            ? <iframe title='drugz' width='560' height='315' src='https://www.youtube.com/embed/olKXXF6iw2s?start=30&autoplay=1' frameBorder='0' allow='autoplay; encrypted-media' allowFullScreen />
            : null
        }

      </div>
    )
  }
}

export default App
