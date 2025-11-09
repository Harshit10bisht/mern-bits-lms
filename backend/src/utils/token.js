const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    sub: user._id,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;

