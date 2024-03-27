function handleError (error, request, response, next) {
  console.log(error.name)
  if (error.name === 'CastError') return response.status(400).end()
  else response.status(500).end()
}

export default handleError
