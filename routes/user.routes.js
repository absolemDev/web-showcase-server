const express = require("express");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const router = express.Router({ mergeParams: true });

router.get("/", auth, async (req, res) => {
  try {
    const list = await User.find();
    res.send(list);
  } catch (e) {
    res
      .status(500)
      .json({ message: "На сервере произошла ошибка. Попробуйте позже." });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id) {
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.send(updatedUser);
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
});

module.exports = router;
