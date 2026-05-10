const BlacklistedToken = require('../models/BlacklistedToken');

module.exports = {
  add: async (token, expiresAt) => {
    await BlacklistedToken.create({ token, expiresAt });
  },
  has: async (token) => {
    const found = await BlacklistedToken.findOne({ token });
    return !!found;
  },
};
