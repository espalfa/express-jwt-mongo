const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
    // Username
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (user) {
            res.status(400).send({ message: "E-mail already exists" });
            return;
        }
        next();
    });
};

const verifySignUp = {
    checkDuplicateEmail
};

module.exports = verifySignUp;