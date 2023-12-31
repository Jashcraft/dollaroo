const { AuthenticationError } = require('apollo-server-express');
const { User, Room} = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find()
        .select('-__v -password')
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password')
    },
    rooms: async () => {
      return Room.find()
        .select('-__v')
    },
    room: async (parent, { id }) => {
      return Room.findOne({ _id: id })
        .select('-__v')
    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user)
      return {token, user};
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user)
      return {token, user};
    }
  }
}

module.exports = resolvers;