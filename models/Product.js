const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: { type: String, requared: true },
    description: { type: String, requared: true },
    img: String,
    rate: Number,
    price: { type: Number, requared: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Classifire",
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
