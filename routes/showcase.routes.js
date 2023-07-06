const express = require("express");
const auth = require("../middleware/auth.middleware");
const Showcase = require("../models/Showcase");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(async (req, res) => {
    try {
      const { orderBy, equalTo } = req.query;
      const list =
        orderBy && equalTo
          ? await Showcase.find({ [orderBy]: equalTo })
          : await Showcase.find();
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
      res.status(201).send(newShowcase);
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
      const showcase = Showcase.findOne({ _id: id });
      res.send(showcase);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .patch(auth, async (req, res) => {
    try {
      const { id } = req.params;
      const showcase = Showcase.findOne({ _id: id });
      if (!showcase) {
        return res.status(404).json({
          message: "Showcase not found",
        });
      }
      if (showcase.owner.toString() !== req.user._id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      showcase = { ...showcase, ...req.body };
      await showcase.save();
      res.send(showcase);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  })
  .delete(auth, async (req, res) => {
    try {
      const { id } = req.params;
      const showcase = Showcase.findOne({ _id: id });
      if (!showcase) {
        return res.status(404).json({
          message: "Showcase not found",
        });
      }
      if (showcase.owner.toString() !== req.user._id) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      await showcase.remove();
      res.send(null);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

module.exports = router;
