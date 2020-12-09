import React from 'react'

import State from './state/Goals'

const Goals = () => {

  const {
    baseHours,
    setBaseHours,
    goalsStr,
    setGoalsStr,
    // selectedWeek,
    // backOneWeek,
    // forwardOneWeek,
  } = State.useContainer()

  return <div>
    {/* <div>Week (Monday):</div> */}
    {/* <div> */}
    {/*   <button onClick={backOneWeek}>&lt;</button> */}
    {/*   <input value={selectedWeek} disabled={true} /> */}
    {/*   <button onClick={forwardOneWeek}>&gt;</button> */}
    {/* </div> */}
    <div className="input-field goals-hours-input">
      <div>Base hours:</div>
      <input value={baseHours} onChange={setBaseHours} type="number" min="0" step="1" />
    </div>
    <div className="input-field goals-input">
      <div>Input goals:</div>
      <textarea value={goalsStr} onChange={setGoalsStr} placeholder="Put here the bullet points of your weekly goals as sent by Heartbeat" />
    </div>
  </div>
}

export default Goals
