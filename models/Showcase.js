const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: { type: String, requared: true },
    description: { type: String, requared: true },
    img: String,
    address: String,
    rate: Number,
    contacts: [Object],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    categories: [{ type: Schema.Types.ObjectId, ref: "Classifire" }],
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Showcase", schema);
