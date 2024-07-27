const router = require('express').Router()

const { User, Blog, Team, ReadingList } = require('../models')
const { tokenExtractor, sessionValidator } = require('../util/middleware')
const { Op } = require('sequelize')

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id)
  if (!user.admin) {
    return res.status(401).json({ error: 'operation not allowed' })
  }
  next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: [
      {
        model: Blog,
        attributes: { exclude: ['userId'] }
      },
      {
        model: Team,
        attributes: ['name', 'id'],
        through: {
          attributes: []
        }
      }
    ]
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  const user = await User.create(req.body)
  res.json(user)
})

router.get('/:id', async (req, res) => {
  let read = {
    [Op.in]: [true, false]
  }
  if (req.query.read) {
    read = req.query.read === 'true'
  }

  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [''] },
    include: [{
      model: Blog,
      attributes: { exclude: ['userId'] }
    },
    {
      model: Blog,
      as: 'readings',
      attributes: { exclude: ['userId'] },
      through: {
        attributes: ['read', 'id'],
        where: {
          read
        }
      },
      include: {
        model: User,
        attributes: ['name']
      },
    },
    {
      model: Team,
      attributes: ['name', 'id'],
      through: {
        attributes: []
      }
    }]
  })

  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.put('/:username', tokenExtractor, sessionValidator, async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username }})
  const userId = req.decodedToken.id
  if (user.id === userId) {
    user.username = req.body.username
    await user.save()
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.put('/set_disabled/:username', tokenExtractor, sessionValidator, isAdmin, async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.params.username
    }
  })

  if (user) {
    user.disabled = req.body.disabled
    await user.save()
    res.json(user)
  } else {
    res.status(404).end()
  }
})

module.exports = router