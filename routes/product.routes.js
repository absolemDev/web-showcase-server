const express = require("express");
const auth = require("../middleware/auth.middleware");
const Product = require("../models/Product");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(async (req, res) => {
    try {
      const { orderBy, equalTo } = req.query;
      const list =
        orderBy && equalTo
          ? await Product.find({ [orderBy]: equalTo })
          : await Product.find();
      res.send(list);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .post(auth, async (req, res) => {
    try {
      const newProduct = await Product.create({
        ...req.body,
        owner: req.user._id,
      });
      res.status(201).send(newProduct);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const product = Product.findOne({ _id: id });
      res.send(product);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .patch(auth, async (req, res) => {
    try {
      const { id } = req.params;
      const product = Product.findOne({ _id: id });
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      if (product.owner.toString() !== req.user._id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      product = { ...product, ...req.body };
      await product.save();
      res.send(product);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .delete(auth, async (req, res) => {
    try {
      const { id } = req.params;
      const product = Product.findOne({ _id: id });
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      if (product.owner.toString() !== req.user._id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      await product.remove();
      res.send(null);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

module.exports = router;
