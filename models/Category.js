const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    classifire: {
      type: Schema.Types.ObjectId,
      ref: "ProductClassifier",
      requared: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    showcases: [{ type: Schema.Types.ObjectId, ref: "Showcase" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Category", schema);
