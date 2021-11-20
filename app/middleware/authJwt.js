const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: "Not authorized" });
  }
  let token = req.headers["authorization"];
  jwt.verify(token.split(" ")[1], config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized" });
    }
    req.userId = decoded.id;
    next();
  });
};

const authJwt = {
  verifyToken
};

module.exports = authJwt;