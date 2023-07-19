const express = require("express");
const auth = require("../middleware/auth.middleware");
const Product = require("../models/Product");
const {
  showcaseExist,
  showcaseAccess,
} = require("../middleware/showcase.middleware");
const {
  productExist,
  productAccess,
} = require("../middleware/product.middleware");
const category = require("../middleware/category.middleware");
const Category = require("../models/Category");
const Comment = require("../models/Comment");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(async (req, res) => {
    try {
      const { orderBy, equalTo } = req.query;
      const list =
        orderBy && equalTo
          ? await Product.find(
              { [orderBy]: equalTo },
              "_id name description img price showcase classifire owner"
            )
          : await Product.find(
              {},
              "_id name description img price showcase classifire owner"
            );
      res.send(list);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .post(auth, showcaseExist, showcaseAccess, category, async (req, res) => {
    try {
      const newProduct = await Product.create({
        ...req.body,
        classifire: req.body.classifire,
        showcase: req.showcase._id,
        owner: req.user._id,
      });
      await req.category.updateOne({
        $addToSet: { showcases: req.showcase._id, products: newProduct._id },
      });
      await req.showcase.updateOne({
        $addToSet: {
          classifire: req.body.classifire,
          products: newProduct._id,
        },
      });
      if (req.categoryIsNew) {
        await req.category.populate("classifire");
        res.send({
          newProduct,
          category: {
            _id: req.category._id,
            name: req.category.classifire.name,
            classifire: req.category.classifire._id,
          },
        });
      } else {
        res.send(newProduct);
        await req.category.populate("classifire");
      }
    } catch (e) {
      console.log(e);
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
  .patch(
    auth,
    showcaseExist,
    showcaseAccess,
    productExist,
    productAccess,
    category,
    async (req, res) => {
      try {
        req.product = { ...req.product, ...req.body };
        await req.product.save();
        res.send(req.product);
      } catch (e) {
        res
          .status(500)
          .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
      }
    }
  )
  .delete(
    auth,
    showcaseExist,
    showcaseAccess,
    productExist,
    productAccess,
    async (req, res) => {
      try {
        const category = Category.findOne({
          classifire: req.product.classifire,
        });
        await Comment.deleteMany({ targetID: req.product._id });
        await category
          .clone()
          .updateOne({ $pull: { products: req.product._id } });
        await req.showcase.updateOne({ $pull: { products: req.product._id } });
        await req.showcase.populate("products");
        const classifireProducts = new Set(
          req.showcase.products.map((item) => item.classifire)
        );
        if (!classifireProducts.has(req.product.classifire)) {
          await category
            .clone()
            .updateOne({ $pull: { showcases: req.showcase._id } });
          await req.showcase.updateOne({
            $pull: { classifire: req.product.classifire },
          });
        }
        await Product.deleteOne({ _id: req.product._id });
        const { _id, showcases, products } = await category.exec();
        if (showcases.length === 0 && products.length === 0) {
          await Category.deleteOne({ _id });
          res.send({ categoryRemove: _id });
        } else {
          res.send(null);
        }
      } catch (e) {
        console.log(e);
        res
          .status(500)
          .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
      }
    }
  );

module.exports = router;
