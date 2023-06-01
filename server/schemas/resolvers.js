const { AuthenticationError } = require('apollo-server-express');
const { User, Characters, Items, Shops } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
   Query: {
      users: async () => {
         return User.find().populate('shop');
      },
      user: async (parent, { userName }) => {
         return User.findOne({ userName }).populate('shops');
      },
      shops: async (parent, { shopId }) => {
         return Shops.findAll({ _id: shopId })
      },
      shop: async (parent, { shopId }) => {
         return Shops.findOne({ _id: shopId });
      },
      items: async (parent, { itemName }) => {
         const params = itemName ? { itemName } : {};
         return Items.find(params).sort({ createdAt: -1 });
      },
      item: async (parent, { itemId }) => {
         return Items.findOne({ _id: itemId });
      },
      characters: async (parent, { characterId }) => {
         return Characters.findAll({ _id: characterId })
      },
      character: async (parent, { characterId }) => {
         return Characters.findOne({ _id: characterId })
      },

   },
   Mutation: {
      addUser: async (parent, { username, email, password }) => {
         const user = await User.create({ username, email, password });
         const token = signToken(user);
         return { token, user };
      },
      login: async (parent, { email, password }) => {
         const user = await User.findOne({ email });

         if (!user) {
            throw new AuthenticationError('No user found with this email address');
         }

         const correctPw = await user.isCorrectPassword(password);

         if (!correctPw) {
            throw new AuthenticationError('Incorrect credentials');
         }

         const token = signToken(user);

         return { token, user };
      },
      addShop: async (parent, { shopsName }, context) => {
         if (context.user) {
            const shop = await Shops.create({
               shopsName,
            });
         }
      },
      addCharacter: async (parent, { characterName }, context) => {
         if (context.user) {
            const shop = await Character.create({
               characterName,
            });
         }
      },
      
      addItem: async (parent, { shopId, itemName }, context) => {
         if (context.user) {
            return Items.findOneAndUpdate(
               { _id: shopId },
               {
                  $addToSet: {
                     Items: { itemName, itemPrice },
                  },
               },
            )
         }
      },

   }
};
module.exports = resolvers;