const express = require("express");
const auth = require("../middleware/auth.middleware");
const {
  showcaseExist,
  showcaseAccess,
} = require("../middleware/showcase.middleware");
const { productAccess } = require("../middleware/product.middleware");
const Showcase = require("../models/Showcase");
const Product = require("../models/Product");
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
          ? await Showcase.find({ [orderBy]: equalTo })
          : await Showcase.find({}, "_id name description img address owner");
      res.send(list);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .post(auth, async (req, res) => {
    try {
      const newShowcase = await Showcase.create({
        ...req.body,
        owner: req.user._id,
      });
      await req.user.updateOne({ $addToSet: { showcases: newShowcase._id } });
      res.status(201).send(newShowcase);
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

router
  .route("/:idShowcase")
  .get(showcaseExist, async (req, res) => {
    await req.showcase.populate("products");
    try {
      await req.showcase.populate("products");
      res.send(req.showcase);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .patch(auth, showcaseExist, showcaseAccess, async (req, res) => {
    try {
      console.log(req.query, req.params);
      const showcase = await Showcase.findByIdAndUpdate(
        req.showcase._id,
        req.body,
        { new: true },
        { select: "_id name description img address owner" }
      );
      res.send(showcase);
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .delete(auth, showcaseExist, showcaseAccess, async (req, res) => {
    try {
      for (const productId of req.showcase.products) {
        const { classifire } = await Product.findByIdAndDelete(productId);
        await Comment.deleteMany({ targetID: productId });
        await Category.updateOne(
          { classifire },
          { $pull: { products: productId } }
        );
      }
      const deletedCategories = [];
      for (const classifireId of req.showcase.classifire) {
        const { _id, products, showcases } = await Category.findOneAndUpdate(
          { classifire: classifireId },
          { $pull: { showcases: req.showcase._id } },
          { new: true }
        );
        if (products.length === 0 && showcases.length === 0) {
          await Category.findByIdAndRemove(_id);
          deletedCategories.push(_id);
        }
      }
      await Showcase.deleteOne({ _id: req.showcase._id });
      if (deletedCategories.length > 0) {
        res.send({ deletedCategories });
      } else {
        res.send(null);
      }
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

router
  .route("/:idShowcase/product")
  .get(showcaseExist, async (req, res) => {
    try {
      const products = await Product.find({ showcase: req.showcase._id })
        .populate("category")
        .populate("classifire");
      res.send(
        products.map((item) => ({
          ...item,
          category: {
            _id: item.category.classifire._id,
            name: item.category.classifire.name,
          },
        }))
      );
    } catch (error) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .put(auth, showcaseExist, showcaseAccess, async (req, res) => {
    try {
      const category =
        (await Category.findOne({
          classifire: req.body.classifier,
        })) ||
        (await Category.create({
          classifire: req.body.classifier,
        }));
      const newProduct = await Product.create({
        ...req.body,
        category: category._id,
        showcase: req.showcase._id,
      });
      await category.updateOne({
        $addToSet: { showcases: req.showcase._id, products: newProduct._id },
      });
      await req.showcase.updateOne({
        $addToSet: { categories: category._id, products: newProduct._id },
      });
      res.send(newProduct);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

router
  .route("/:idShowcase/product/:idProduct")
  .patch(
    auth,
    showcaseExist,
    showcaseAccess,
    productAccess,
    async (req, res) => {
      try {
        await req.product.updateOne(req.body);
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
    productAccess,
    async (req, res) => {
      try {
        await Comment.deleteMany({ targetID: req.product._id });
        await req.showcase.updateOne({ $pull: { products: req.product._id } });
        const { products } = await Showcase.findById(req.showcase._id).populate(
          "products"
        );
        if (
          products.findIndex(
            (item) =>
              item.category.toString() === req.product.category.toString()
          ) > -1
        ) {
          await Category.updateOne(
            { _id: req.product.category },
            { $pull: { products: req.product._id } }
          );
        } else {
          await Category.updateOne(
            { _id: req.product.category },
            {
              $pull: { products: req.product._id, showcases: req.showcase._id },
            }
          );
          await req.showcase.updateOne({
            $pull: { categories: req.product.category },
          });
        }
        await Product.deleteOne({ _id: req.product._id });
        res.send(null);
      } catch (e) {
        res
          .status(500)
          .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
      }
    }
  );

module.exports = router;
