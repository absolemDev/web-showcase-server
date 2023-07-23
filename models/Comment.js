const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    rating: { type: Number, requared: true },
    content: { type: String, requared: true },
    targetId: { type: Schema.Types.ObjectId, ref: "Product", requared: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", requared: true },
    reply: String,
  },
  {
    timestamps: { createdAt: "created_at" },
  }
);

module.exports = model("Comment", schema);
