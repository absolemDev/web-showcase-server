const Showcase = require("../models/Showcase");

module.exports = {
  showcaseExist: async (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    try {
      const idShowcase = req.params.idShowcase
        ? req.params.idShowcase
        : req.query.idShowcase;
      const showcase = await Showcase.findById(idShowcase);
      if (!showcase) {
        return res.status(404).json({
          message: "Showcase not found",
        });
      }

      req.showcase = showcase;
      next();
    } catch (e) {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  },
  showcaseAccess: async (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    try {
      if (req.showcase.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Showcase access denied",
        });
      }
      next();
    } catch (e) {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  },
};
