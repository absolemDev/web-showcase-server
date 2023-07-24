const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    img: String,
    password: String,
    showcases: [{ type: Schema.Types.ObjectId, ref: "Showcase" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", schema);
