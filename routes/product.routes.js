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
const Showcase = require("../models/Showcase");
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
              "_id name description img price showcase classifire owner rate"
            )
          : await Product.find(
              {},
              "_id name description img price showcase classifire owner rate"
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
      const response = {};
      const newProduct = await Product.create({
        img: "https://w7.pngwing.com/pngs/446/762/png-transparent-computer-icons-e-commerce-business-service-cost-business-text-service-people.png",
        ...req.body,
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
        response.category = {
          _id: req.category._id,
          name: req.category.classifire.name,
          classifire: req.category.classifire._id,
        };
      }
      response.showcase = await Showcase.findById(
        req.showcase._id,
        "_id name description img address owner classifire rate"
      );
      response.product = await Product.findById(
        newProduct._id,
        "_id name description img price showcase classifire owner rate"
      );
      res.send(response);
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
  .patch(
    auth,
    showcaseExist,
    showcaseAccess,
    productExist,
    productAccess,
    category,
    async (req, res) => {
      try {
        const response = {};
        if (
          req.product.classifire.toString() ===
          req.category.classifire.toString()
        ) {
          response.product = await Product.findByIdAndUpdate(
            req.product._id,
            req.body,
            { new: true },
            { select: "_id name description img owner price classifire rate" }
          );
        } else {
          const oldCategory = await Category.findOne({
            classifire: req.product.classifire,
          });
          await req.showcase.populate("products");
          const classifireProducts = new Set(
            req.showcase.products
              .filter(
                (item) => item._id.toString() !== req.product._id.toString()
              )
              .map((item) => {
                return item.classifire.toString();
              })
          );
          if (classifireProducts.has(oldCategory.classifire.toString())) {
            await oldCategory
              .updateOne({
                $pull: { products: req.product._id },
              })
              .exec();
            await req.category.updateOne({
              $addToSet: { product: req.product._id },
            });
          } else {
            await req.showcase.updateOne({
              $pull: { classifire: oldCategory.classifire },
            });
            await oldCategory
              .updateOne({
                $pull: {
                  products: req.product._id,
                  showcases: req.showcase._id,
                },
              })
              .exec();
          }
          await req.showcase
            .updateOne({
              $addToSet: { classifire: req.category.classifire },
            })
            .exec();
          response.showcase = await Showcase.findById(
            req.showcase._id,
            "_id name description img address owner classifire rate"
          );
          await req.category.updateOne({
            $addToSet: {
              products: req.product._id,
              showcases: req.showcase._id,
            },
          });
          if (req.categoryIsNew) {
            await req.category.populate("classifire");
            response.categoryNew = {
              _id: req.category._id,
              name: req.category.classifire.name,
              classifire: req.category.classifire._id,
            };
          }
          const { _id, showcases, products } = await Category.findById(
            oldCategory._id
          );
          if (showcases.length === 0 && products.length === 0) {
            await Category.deleteOne({ _id });
            response.categoryRemoved = _id;
          }
          response.product = await Product.findByIdAndUpdate(
            req.product._id,
            req.body,
            { new: true },
            { select: "_id name description img owner price classifire rate" }
          );
        }
        res.send(response);
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
        const response = {};
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
          req.showcase.products
            .filter(
              (item) => item._id.toString() !== req.product._id.toString()
            )
            .map((item) => item.classifire.toString())
        );
        if (!classifireProducts.has(req.product.classifire.toString())) {
          await category
            .clone()
            .updateOne({ $pull: { showcases: req.showcase._id } });
          await req.showcase.updateOne({
            $pull: { classifire: req.product.classifire },
          });
          response.showcase = await Showcase.findById(
            req.showcase._id,
            "_id name description img address owner classifire rate"
          );
        }
        await Product.deleteOne({ _id: req.product._id });
        const { _id, showcases, products } = await category.exec();
        if (showcases.length === 0 && products.length === 0) {
          await Category.deleteOne({ _id });
          response.categoryRemove = _id;
        }
        res.send(response);
      } catch (e) {
        res
          .status(500)
          .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
      }
    }
  );

module.exports = router;
