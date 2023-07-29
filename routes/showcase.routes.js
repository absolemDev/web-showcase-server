const express = require("express");
const auth = require("../middleware/auth.middleware");
const {
  showcaseExist,
  showcaseAccess,
} = require("../middleware/showcase.middleware");
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
          : await Showcase.find(
              {},
              "_id name description img address owner classifire rate"
            );
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
        img: "https://cdn0.iconfinder.com/data/icons/business-collection-2027/60/store-1-1024.png",
        ...req.body,
        owner: req.user._id,
      });
      await req.user.updateOne({ $addToSet: { showcases: newShowcase._id } });
      const showcase = await Showcase.findById(
        newShowcase._id,
        "_id name description img address owner classifire rate"
      );
      res.status(201).send(showcase);
    } catch (e) {
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
      const showcase = await Showcase.findByIdAndUpdate(
        req.showcase._id,
        req.body,
        { new: true },
        { select: "_id name description img address owner classifire rate" }
      );
      res.send(showcase);
    } catch (e) {
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
      req.user.updateOne({ $pull: { showcases: req.showcase._id } });
      if (deletedCategories.length > 0) {
        res.send({ deletedCategories });
      } else {
        res.send(null);
      }
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

module.exports = router;
