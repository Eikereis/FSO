import { useState } from 'react'
                                    



const Statistics = (props) => {

  if (!(props.good || props.neutral || props.bad)) {return <p>No feedback given</p>}
  return (
    <div>
        <h1>statistics</h1>
        <table>
          <tbody>
            <StatisticLine text="good" value={props.good}/>
            <StatisticLine text="neutral" value={props.neutral}/>
            <StatisticLine text="bad" value={props.bad}/>
            <StatisticLine text="all" value={props.good + props.bad + props.neutral}/>
            <StatisticLine text="average" value={(props.good - props.bad) / (props.good + props.bad + props.neutral)}/>
            <StatisticLine text="positive" value={(props.good * 100/ (props.good+ props.neutral + props.bad)) + " %"} />
          </tbody>
        </table>

        
    </div> 
  )
}

const Button = (props)=>{
  return <button onClick={props.handleClick}>{props.text}</button>
}

const StatisticLine=(props)=>{
  return (
    <tr>
      <td>{props.text}</td><td>{props.value}</td>
    </tr>
  )
}

const App = () => {
  // tallenna napit omaan tilaansa
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  
  const goodClick = () => {
    setGood(good+1)
  }
  const neutralClick = () => {
    setNeutral(neutral+1)
  }
  const badClick = () => {
    setBad(bad+1)
  }


  return (
      <div>
        <h1>give feedback</h1>                    
        <Button handleClick={goodClick} text="good"/>
        <Button handleClick={neutralClick} text="neutral"/>
        <Button handleClick={badClick} text="bad"/>                
        <Statistics good={good}  neutral= {neutral} bad={bad} />
      </div>
  )
}

export default App