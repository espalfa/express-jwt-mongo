const mongoose = require("mongoose");

const Phone = mongoose.model(
  "Phone",
  new mongoose.Schema({
    number: Number,
    ddd: Number
  })
);

module.exports = Phone;