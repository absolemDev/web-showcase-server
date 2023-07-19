const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: { type: String, requared: true },
    description: { type: String, requared: true },
    img: String,
    rate: { type: String, default: 0, requared: true },
    price: { type: Number, requared: true },
    classifire: {
      type: Schema.Types.ObjectId,
      ref: "ProductClassifier",
      requared: true,
    },
    showcase: { type: Schema.Types.ObjectId, ref: "Showcase", requared: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", requared: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Product", schema);
