const express = require("express");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "_id name img");
    res.send(users);
  } catch (e) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

router.patch("/", auth, async (req, res) => {
  try {
    const { _id, name, img } = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
      }
    );
    res.send({ _id, name, img });
  } catch (e) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

module.exports = router;
