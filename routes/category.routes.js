const express = require("express");
const auth = require("../middleware/auth.middleware");
const Category = require("../models/Category");
const ProductClassifire = require("../models/ProductClassifier");
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const list = await Category.find({}).populate("classifire");
    list.sort((a, b) => (a.classifire.name > b.classifire.name ? 1 : -1));
    res.send(
      list.map((item) => ({
        _id: item._id,
        name: item.classifire.name,
        classifire: item.classifire.id,
      }))
    );
  } catch (e) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

module.exports = router;
