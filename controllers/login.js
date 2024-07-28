const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')

router.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  const passwordCorrect = body.password === 'secret'

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  if (user.disabled) {
    return response.status(401).json({
      error: 'account disabled, please contact admin'
    })
  }

  // delete previous sessions if they exist, so older tokens don't work
  const previousSession = await Session.findAll({ where: { userId: user.id }})
  if (previousSession) {
    Session.destroy({ where: { userId: user.id } })
  }

  const session = await Session.create({
    userId: user.id,
  })

  const userForToken = {
    username: user.username,
    id: user.id,
    sessionId: session.id
  }

  const token = jwt.sign(userForToken, SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router