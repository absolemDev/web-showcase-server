const express = require("express");
const auth = require("../middleware/auth.middleware");
const Comment = require("../models/Comment");
const Product = require("../models/Product");
const Showcase = require("../models/Showcase");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(async (req, res) => {
    try {
      const list = await Comment.find();
      res.send(list);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .post(auth, async (req, res) => {
    try {
      const response = {};
      response.comment = await Comment.create({
        ...req.body,
        userId: req.user._id,
      });
      response.product = await Product.findByIdAndUpdate(
        req.body.targetId,
        { $inc: { "rate.amount": 1, "rate.count": req.body.rating } },
        { new: true, select: "-createdAt -updatedAt" }
      );
      response.showcase = await Showcase.findByIdAndUpdate(
        response.product.showcase,
        { $inc: { "rate.amount": 1, "rate.count": req.body.rating } },
        { new: true, select: "-createdAt -updatedAt -products" }
      );
      res.status(201).send(response);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

router
  .route("/:id")
  .delete(auth, async (req, res) => {
    try {
      const { id } = req.params;
      const removedComment = await Comment.findById(id);
      if (removedComment.userId.toString() === req.user._id.toString()) {
        await Comment.deleteOne({ _id: id });
        return res.send(null);
      } else {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .patch(auth, async (req, res) => {
    try {
      const { id } = req.params;
      const comment = await Comment.findByIdAndUpdate(
        id,
        {
          reply: { ...req.body, createdAt: new Date() },
        },
        { new: true }
      );
      res.send(comment);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

module.exports = router;
