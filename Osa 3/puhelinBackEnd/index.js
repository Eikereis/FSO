const express = require("express")
const morgan = require("morgan")
const app = express()
const cors = require("cors")
const PORT = process.env.PORT || 3001
app.use(cors())
app.use(express.static("build"))
app.use(morgan("dev"))

morgan.token("body", (req, res) => JSON.stringify(req.body))
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body]")
)

app.use(express.json())


let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]



app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
     <p>${new Date()}</p>`
  )
})

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    response.send(person)
  } else {
    response.status(404).send({ error: "Person not found" })
  }
})

app.get("/api/persons", (request, response) => {
  response.send(persons)
});

app.listen(3001, () => {
  console.log("Server running on port 3001")
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})  



const generateId = () => Math.floor(Math.random() * 1000000)

app.post("/api/persons", (request, response) => {
  const { name, number } = request.body
  const chekIfAlreadyExist = persons.some((person) => person.name === name)

  if (!name || !number) {
    return response.status(400).json({
      error: "name or number is missing",
    })
  }

  if (chekIfAlreadyExist) {
    return response.status(400).json({
      error: "name must be unique",
    })
  }

  const person = {
    name: name,
    number: number || null,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})