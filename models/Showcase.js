const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: { type: String, requared: true },
    description: { type: String, requared: true },
    img: String,
    address: String,
    rate: {
      type: Schema.Types.Mixed,
      default: { amount: 0, count: 0 },
    },
    contacts: [Object],
    owner: { type: Schema.Types.ObjectId, ref: "User", requared: true },
    classifire: [{ type: Schema.Types.ObjectId, ref: "ProductClassifier" }],
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Showcase", schema);
