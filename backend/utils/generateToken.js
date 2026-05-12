const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token for a given user ID.
 * @param {string} userId - The MongoDB _id of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

module.exports = generateToken;
