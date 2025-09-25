import { useState, useEffect} from 'react'
import axios from 'axios'
import noteService from '../services/notes'
import './index.css'
const Filter = ({ filter, setFilter }) => {
  return (
    <div>
      filter shown with <input value={filter} onChange={e => setFilter(e.target.value)} />
    </div>
  )
}

const PersonForm = ({ name, number, handleAddPerson, handleNameChange, handleNumberChange }) => { 
  return (
    <form onSubmit={handleAddPerson}>
      <div>
        name: <input value={name} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={number} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}


  const Persons = ({ persons, filter, removePerson }) => {
  return (
    <ul>
      {persons
        .filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
        .map((person, index) => (
          <li key={index}>{person.name} {person.number}
          <button onClick={() => removePerson(person.id)}>delete</button>
          </li>
        ))}
    </ul>
  )
}

const App = () => {
  
  const [persons, setPersons] = useState([])
  useEffect(() => {
    noteService      
    .getAll()     
    .then(response => {        
      setPersons(response.data)
      })
    .catch(error => {
      alert(` Something went wrong'${error.message}' Sigma `)
    })
  }, [])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')  
  const [errorMessage, setErrorMessage] = useState('')


  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }


  const Notification = ({ message }) => {
  if (!message) return null
  return (
    <div className={message.includes('error') ? 'error' : 'errorless'}>
      {message}
    </div>
  )

}

  const duplicateName = (name) => {
    if (persons.some(person => person.name === name)) {
      if (window.confirm(`${name} is already added to phonebook, replace the old number with a new one?`)) {
        const id = persons.find(person => person.name === name).id
        noteService
          .update(id, { name: name, number: newNumber })
          .then(response => {
            setPersons(persons.map(person => person.id === id ? response.data : person))
            setNewName('')
            setNewNumber('')
          })
      }
      return true 
    }
    return false 
  }

  const removePerson = (id) => {
    noteService
      .remove(id)
      .then(() => {
          setPersons(persons.filter(person => person.id !== id))
      })
  }

  const handleAddPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }

    if (newNumber) {
      if (!duplicateName(newName)) {
        
        // Only add if not duplicate
        noteService

          .create(personObject)
          .then(response => {
            setPersons(persons.concat(response.data))
            setNewName('')
            setNewNumber('')
            setErrorMessage(
              `Added ${personObject.name}`
            )
            setTimeout(() => {
              setErrorMessage(null)
            }, 5000)
          })
            .catch(error => {
              setErrorMessage(
                `Information of ${personObject.name} has already been removed from server`
              )
              setTimeout(() => {
                setErrorMessage(null)
              }, 5000)
            })
      }
    }
  }



return (
    <div>
      <Notification message={errorMessage} />
      <h2>Phonebook</h2>
      <Filter filter={filter} setFilter={setFilter} />
      <h3>Add a new</h3>
      <PersonForm 
        name={newName} 
        number={newNumber}
        handleAddPerson={handleAddPerson}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} removePerson={removePerson} />
    </div>
  )

}

export default App