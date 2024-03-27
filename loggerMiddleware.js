const logger = (request, response, next) => {
  console.log('Metodo: ', request.method)
  console.log('/URL: ', request.path)
  console.log('Cuerpo: ', request.body)
  console.log('----------')
  next()
}

export default logger
