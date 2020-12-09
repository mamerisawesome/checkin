import React, { useRef } from 'react'

import State from "./state/Checkins";

const Checkins = () => {

  const {
    state,
    setState,
    getStartTime,
    sortedEntries,
    totalHours,
    isLogged,
    targetMet,
    runningHours,
    now,
    selectedDate,
    selectToday,
    backOneDay,
    forwardOneDay,
    addEntry,
    updateEntry,
    deleteEntry,
    clearEntries
  } = State.useContainer();

  const projectRef = useRef()
  const tasksRef = useRef()
  const exportRef = useRef()

  const addEntryAndClearInput = () => {

    const [date, time] = now.toISOString().split('T')
    const [hour, minute] = time.split(':')

    const id = Date.now()
    const entry = {
      project: projectRef.current.value,
      tasks: tasksRef.current.value,
      date,
      hour,
      minute,
      id
    }

    addEntry(entry)

    projectRef.current.value = null
    tasksRef.current.value = null

  }

  const confirmClearEntries = () => {
    if (window.confirm('Are you sure you want to clear all entries for this date? You cannot undo this!')) {
      clearEntries()
    }
  }

  const output = () => {
    const lines = []
    const entries = sortedEntries()
    const date = entries.length ? entries[0].date : ''
    const header = `checkin ${date}`
    lines.push(header)
    for (const i in entries) {
      if (+i === entries.length - 1) break
      const e = entries[i]
      if (!isLogged(e)) continue
      const duration = ((getStartTime(entries[+i + 1]) - getStartTime(e)) / 3600000).toFixed(2)
      const line = ['-', duration, 'hrs', e.project, e.tasks].join(' ')
      lines.push(line)
    }
    return lines.join('\n')
  }

  const handleKeyPress = (e) => {
    if (e.which === 13) {
      addEntryAndClearInput()
      projectRef.current.focus()
    }
  }

  const exportState = () => {
    const target = exportRef.current
    target.focus()
    target.setSelectionRange(0, target.value.length)
    document.execCommand('copy')
    alert('Copied to clipboard!')
  }

  const importState = () => {
    setState(JSON.parse(window.prompt('Enter state here:')))
  }

  return (
    <div>

      <div className="checkin-date-handler">
        <h3>Selected Date</h3>
        <button onClick={selectToday}>Today</button>
        <button onClick={backOneDay}>&lt;</button>
        {selectedDate}
        <button onClick={forwardOneDay}>&gt;</button>
      </div>

      <p>
        Make sure your project starts with #. Otherwise, the activity entry is treated as non-work (break, lunch, etc.)
      </p>

      <div>
        <h3>Input</h3>
        <input ref={projectRef} placeholder='#project / out / break / lunch / whatever' onKeyPress={handleKeyPress} />
        <input ref={tasksRef} placeholder='stuff, i, did (optional)' onKeyPress={handleKeyPress} />
        <span>(Press enter)</span>
      </div>

      <div>
        <h3>
          Entries
          <button onClick={confirmClearEntries}>
            Clear
          </button>
        </h3>
        <table>
          <tbody>
            {sortedEntries().map(e => {
              return (
                <tr key={e.id}>
                  {['project', 'tasks', 'date', 'hour', 'minute'].map(field => {
                    return (
                      <td key={field}>
                        <input value={e[field]} onChange={ev => updateEntry(e.id, field, ev.target.value)} />
                      </td>
                    )
                  })}
                  <td>
                    <button className='delete' onClick={_ => deleteEntry(e.id)}>
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
          Output [{totalHours().toFixed(2)} hrs total
          going on <span style={{color: targetMet() ? 'green' : '#000'}}>{runningHours().toFixed(4)}</span>]
        </h3>
        <textarea value={output()} readOnly />
      </div>

      <textarea id='export' ref={exportRef} value={JSON.stringify(state)} readOnly />
      <button className="checkin-export-button" onClick={e => exportState()}>
        Export
      </button>
      <button className="checkin-import-button" onClick={e => importState()}>
        Import
      </button>

      {
        targetMet()
          ? <iframe title='drugz' width='560' height='315' src='https://www.youtube.com/embed/olKXXF6iw2s?start=30&autoplay=1' frameBorder='0' allow='autoplay; encrypted-media' allowFullScreen />
          : null
      }

    </div>
  )
}

export default Checkins
