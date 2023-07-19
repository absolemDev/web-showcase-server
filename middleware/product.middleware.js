const Product = require("../models/Product");

module.exports = {
  productExist: async (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      req.product = product;
      next();
    } catch (e) {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  },
  productAccess: async (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    try {
      if (!req.showcase.products.includes(req.product._id)) {
        return res.status(403).json({
          message: "Product access denied",
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
