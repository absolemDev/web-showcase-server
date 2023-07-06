const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    content: { type: String, requared: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", requared: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", requared: true },
    reply: String,
    history: [{ content: String, reply: String }],
  },
  {
    timestamps: { createdAt: "created_at" },
  }
);

module.exports = model("Comment", schema);
