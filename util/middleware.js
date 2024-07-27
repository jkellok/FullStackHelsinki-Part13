const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const Session = require('../models/session')
const { User } = require('../models')

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const sessionValidator = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      const userId = req.decodedToken.id
      const user = await User.findOne({ where: { id: userId }})

      const session = await Session.findOne({
        where: {
          userId: userId,
          id: req.decodedToken.sessionId
        }
      })
      console.log("session", session)
      if (!(session)) {
        return res.status(401).json({ error: 'no session found for token'})
      }
      if (user.disabled) {
        session.isValid = false
        await session.save()
        return res.status(401).json({ error: 'account disabled, please contact admin' })
      }
      if (!(session.isValid)) {
        return res.status(401).json({ error: 'session is not valid, login again' })
      }
    } catch {
      return res.status(401).json({ error: 'error validating session' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'SequelizeValidationError') {
    console.log(error)
    return res.status(400).send({ error: error.message })
  } else if (error.name === 'SequelizeDatabaseError') {
    return res.status(400).send({ error: error.message})
  }
  next(error)
}

module.exports = {
  tokenExtractor,
  sessionValidator,
  unknownEndpoint,
  errorHandler
}