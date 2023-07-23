const express = require("express");
const auth = require("../middleware/auth.middleware");
const Comment = require("../models/Comment");
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
      const newComment = await Comment.create({
        ...req.body,
        userId: req.user._id,
      });
      res.status(201).send(newComment);
    } catch (e) {
      res
        .status(500)
        .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
    }
  });

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const removedComment = await Comment.findById(id);
    if (removedComment.userId.toString() === req.user._id) {
      await removedComment.remove();
      return res.send(null);
    } else {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

module.exports = router;
