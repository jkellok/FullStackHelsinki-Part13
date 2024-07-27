const router = require('express').Router()

const { Blog, User, ReadingList } = require('../models')
const { tokenExtractor, sessionValidator } = require('../util/middleware')
const { Op } = require('sequelize')

router.get('/', async (req, res) => {
  const reading_list = await ReadingList.findAll()
  res.json(reading_list)
})

// add blog to reading list with blog id and user id
router.post('/', tokenExtractor, sessionValidator, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  const blog = await Blog.findByPk(req.body.blogId)
  if (user && blog) {
    const reading_list = await ReadingList.create({blogId: blog.id, userId: user.id})
    res.json(reading_list)
  } else {
    res.status(404).end()
  }
})

router.put('/:id', tokenExtractor, sessionValidator, async (req, res) => {
  reading_list = await ReadingList.findByPk(req.params.id)
  const user = await User.findByPk(req.decodedToken.id)
  if (reading_list && user.id === reading_list.userId) {
    reading_list.read = req.body.read
    await reading_list.save()
    res.json(reading_list)
  } else {
    res.status(404).end()
  }
})

module.exports = router