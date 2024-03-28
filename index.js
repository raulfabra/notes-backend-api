import dotenv from 'dotenv'
import connectDB from './mongo.js'
import express from 'express'
import logger from './loggerMiddleware.js'
import cors from 'cors'
import Note from './models/Note.js'
import notFound from './middlewares/notFound.js'
import handleError from './middlewares/handleErrors.js'

import Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

dotenv.config()
connectDB()
const app = express()

app.use(cors()) // Esto son middleWare imprescindible para que puedan acceder desde el exterior a nuestra api lanzada en producción. Esto se podría configurar para determinar que origenes (endopoints) queremos que sean accesibles, etc. Asi tal cual es accesible en toda la API. Pd: De todas maneras si se quiere hacer esto es mejor utilizar JWT, tokens, authentificator. Porque en el fondo el origen es muy facil hackear, dato de un profesional.
app.use(express.json())
app.use('/public', express.static('public'))

Sentry.init({
  dsn: 'https://3bd156af7955a0d03a568f7d61710ba6@o4506983486717952.ingest.us.sentry.io/4506983489011712',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    nodeProfilingIntegration()
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0
})
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())
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

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

app.use(notFound)
app.use(handleError)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
