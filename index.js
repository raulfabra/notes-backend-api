import dotenv from 'dotenv'
import connectDB from './mongo.js'
import express from 'express'
import logger from './loggerMiddleware.js'
import cors from 'cors'
import Note from './models/Note.js'
import notFound from './middlewares/notFound.js'
import handleError from './middlewares/handleErrors.js'

dotenv.config()
connectDB()
const app = express()

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
app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id

  Note.findById(id)
    .then(note => note ? response.json(note) : response.status(404).end())
    .catch(e => next(e))
})
app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findByIdAndDelete(id)
    .then(note => response.status(204).send({ message: 'Se ha eliminado satisfactoriamente' }))
    .catch(e => next(e))
})
app.post('/api/notes', (request, response, next) => {
  const note = request.body

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important || false
  })

  newNote.save().then(savedNote => {
    response.json(savedNote)
  }).catch(e => {
    next(e)
  })
})
app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const updateNote = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, updateNote, { new: true })
    .then(note => response.json(note))
    .catch(e => next(e))
})

app.use(notFound)
app.use(handleError)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
