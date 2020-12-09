import React from 'react'
import styled from "styled-components"

const TabOption = styled(({id, label, isCurrent, className, onClick}) => {
  return (
    <div id={id} className={className} onClick={onClick}>
      {label}
    </div>
  )
})`
  flex-grow: 1;
  text-align: center;
  padding: 15px 0px;
  color: ${({isCurrent}) => isCurrent ? 'white' : 'black'};
  background-color: ${({isCurrent}) => isCurrent ? 'red' : '#eee'};
  font-weight: ${({isCurrent}) => isCurrent ? 'bold' : 'normal'};
  text-transform: capitalize;
  border-radius: 5px;
`

const Tabs = ({tabs, current, setCurrent, className}) => {

  const CurrentComp = tabs[current]

  return <div className={className}>
    <div className="options">
      {Object.keys(tabs).map(tab => (
        <TabOption key={tab} id={`tab-${tab}`} label={tab}
          isCurrent={tab === current}
          onClick={() => setCurrent(tab)}/>
      ))}
    </div>
    <div className="main">
      <CurrentComp />
    </div>
  </div>
}

export default styled(Tabs)`
  .options {
    display: flex;
    justify-content: center;
    align-items: stretch;
  }

  .main {
    padding: 10px;
    border: 2px solid red;
    border-radius: 5px;
  }
`
