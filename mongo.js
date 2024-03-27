import mongoose from 'mongoose'

function connectDB () {
  const connectionString = process.env.MONGO_DB_URI
  // conexión a mongoDB
  mongoose.connect(connectionString)
    .then(() => {
      console.log('Database connected')
    }).catch(err => {
      console.log(err)
    })
}

export default connectDB
/* Note.find({}).then(result => {
  console.log(result)
  mongoose.connection.close()
}) */
/* const note = new Note({
  content: 'MongoDB es no-SQL',
  date: new Date(),
  important: true
})

note.save()
  .then(result => {
    console.log(result)
    mongoose.connection.close()
  }).catch(err => {
    console.log(err)
  })
 */
