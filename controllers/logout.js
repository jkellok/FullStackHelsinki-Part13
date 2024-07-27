const router = require('express').Router()

const User = require('../models/user')
const Session = require('../models/session')
const { tokenExtractor, sessionValidator } = require('../util/middleware')

router.delete('/', tokenExtractor, sessionValidator, async (req, res) => {
  const userId = req.decodedToken.id

  const user = await User.findOne({
    where: {
      id: userId
    }
  })

  const session = await Session.findOne({
    where: {
      userId: userId,
      id: req.decodedToken.sessionId
    }
  })

  if (!(user)) {
    return res.status(401).json({
      error: 'error: user not found'
    })
  }

  if (!(session)) {
    return res.status(401).json({
      error: 'an active session was not found'
    })
  }

  if (user.disabled) {
    return res.status(401).json({
      error: 'account disabled, please contact admin'
    })
  }

  await session.destroy()

  res
    .send({ message: "Logged out!" })
    .status(204)
})

module.exports = router