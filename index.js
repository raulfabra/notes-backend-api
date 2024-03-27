import dotenv from 'dotenv'
import connectDB from './mongo.js'
import express from 'express'
import logger from './loggerMiddleware.js'
import cors from 'cors'
import Note from './models/Note.js'

dotenv.config()
connectDB()
const app = express()

let notes = [
  /* {
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
  } */
]

app.use(cors()) // Esto son middleWare imprescindible para que puedan acceder desde el exterior a nuestra api lanzada en producción. Esto se podría configurar para determinar que origenes (endopoints) queremos que sean accesibles, etc. Asi tal cual es accesible en toda la API. Pd: De todas maneras si se quiere hacer esto es mejor utilizar JWT, tokens, authentificator. Porque en el fondo el origen es muy facil hackear, dato de un profesional.
app.use(express.json())
app.use(logger) // Los middlewares tambien se pueden utilizar a nivel de cada PATH, entremedias de el PATH y el CALLBACK.

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
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

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
