const express = require("express");
const auth = require("../middleware/auth.middleware");
const ProductClassifire = require("../models/ProductClassifier");
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    const reg = new RegExp(`^${name}|[^а-яА-Я]${name}`, "i");
    const list = await ProductClassifire.find({
      name: reg,
    }).sort("name");
    res.send(list);
  } catch (e) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

module.exports = router;
