import express from 'express'
import logger from './loggerMiddleware.js'

let notes = [
  {
    id: 1,
    content: 'loremIpsun loremIpsun loremIpsun loremIpsun loremIpsun loremIpsun loremIpsun loremIpsun loremIpsun',
    data: '2024-05-31',
    important: true
  },
  {
    id: 2,
    content: 'PaquitoSalas PaquitoSalas PaquitoSalas PaquitoSalas PaquitoSalas PaquitoSalas PaquitoSalas PaquitoSalas PaquitoSalas',
    data: '2024-12-31',
    important: true
  },
  {
    id: 3,
    content: 'JoaquinSabina JoaquinSabina JoaquinSabina JoaquinSabina JoaquinSabina JoaquinSabina JoaquinSabina JoaquinSabina JoaquinSabina',
    data: '1985-19-14',
    important: true
  },
  {
    id: 4,
    content: 'GustavoAdolfoBequer GustavoAdolfoBequer GustavoAdolfoBequer GustavoAdolfoBequer GustavoAdolfoBequer GustavoAdolfoBequer GustavoAdolfoBequer GustavoAdolfoBequer GustavoAdolfoBequer',
    data: '1963-09-02',
    important: true
  }
]

const app = express()
app.use(express.json())
app.use(logger)

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})
app.get('/api/notes', (request, response) => {
  response.json(notes)
})
app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)
  if (note) response.send(note)
  else response.status(404).end()
})
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const ids = notes.map(note => note.id)
  const maxId = Math.max(...ids)

  const newNote = {
    id: maxId + 1,
    content: note.content,
    date: new Date().toISOString(),
    important: typeof note.important !== 'undefined' ? note.important : false
  }

  // notes = [...notes, newNote]
  notes = notes.concat(newNote)

  response.status(201).json(newNote)
})

app.use((request, response, next) => {
  response.status(404).json({
    error: 'Not found'
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
