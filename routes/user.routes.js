const express = require("express");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const Showcase = require("../models/Showcase");
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "_id name img");
    res.send(users);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

router.patch("/", auth, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    res.send(updatedUser);
  } catch (e) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

module.exports = router;
