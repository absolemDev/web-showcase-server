const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    class: { type: String, requared: true },
    baseNumber: { type: String, requared: true },
    name: { type: String, requared: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Classifier", schema);
