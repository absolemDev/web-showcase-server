const Category = require("../models/Category");

module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const dateStamp = new Date();
    const category =
      (await Category.findOne({
        classifire: req.body.classifire,
      })) ||
      (await Category.create({
        classifire: req.body.classifire,
      }));
    req.categoryIsNew = dateStamp > new Date(category.createdAt) ? false : true;
    req.category = category;
    next();
  } catch (e) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};
