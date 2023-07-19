const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    classifire: { type: String, requared: true },
    baseNumber: { type: String, requared: true },
    name: { type: String, requared: true },
  },
  {
    timestamps: true,
    collection: "productsClassifire",
  }
);

module.exports = model("ProductClassifier", schema);
