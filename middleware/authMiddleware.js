const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      //   0        1
      token = req.headers.authorization.split(' ')[1]; // Bearer kdjfasjkj

      // decodes token id
      // const decoded = jwt.verify(token, process.env.JWT_SECRET); // will verify the token if valid will return decoded payload if not will throw error
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: process.env.Issuer,
        audience: process.env.Audience,
      });
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };
