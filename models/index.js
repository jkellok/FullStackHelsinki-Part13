const Blog = require('./blog')
const User = require('./user')
const Team = require('./team')
const Membership = require('./membership')
const ReadingList = require('./reading_list')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)

User.belongsToMany(Team, { through: Membership })
Team.belongsToMany(User, { through: Membership })

User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })
Blog.belongsToMany(User, { through: ReadingList, as: 'users_marked' })

User.hasMany(Session)
Session.belongsTo(User)

module.exports = {
  Blog,
  User,
  Team,
  Membership,
  ReadingList,
  Session
}