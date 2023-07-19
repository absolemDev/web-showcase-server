const tokenService = require("../services/token.services");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const data = tokenService.validateAccess(token);
    if (!data) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = await User.findById(data._id);
    next();
  } catch (e) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};
