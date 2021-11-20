const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Phone"
      }
    ],
    creation_date: Date,
    update_date: Date,
    last_login: Date,
    token: String
  })
);

module.exports = User;