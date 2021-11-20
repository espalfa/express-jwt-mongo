const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Phone = db.phone;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    const date = new Date();
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        creation_date: date,
        update_date: date,
        last_login: date,
        token: 'token'
    });
    if (!req.body.phones) {
        res.status(400).send({ message: 'Bad request must contain a phones array' });
        return;
    }
    if (!Array.isArray(req.body.phones)) {
        res.status(400).send({ message: 'Bad request must contain a phones array' });
        return;
    }
    const phones = req.body.phones;
    console.log('PHONES:', phones);
    Phone.insertMany(phones).then(phones => {
        console.log('resultado phones: ', phones);
        user.phones = phones.map(phone => phone._id);
        user.save((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 1800 // 30 minutes
            });

            User.findByIdAndUpdate(user._id, { token: token }).then(modifiedUser => {
                res.status(200).send({
                    id: modifiedUser._id,
                    creation_date: modifiedUser.creation_date,
                    update_date: modifiedUser.update_date,
                    last_login: modifiedUser.creation_date,
                    token: token
                });
            }).catch((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });
        });
    }).catch((err) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
    });
};


exports.signin = (req, res) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        } if (!user) {
            return res.status(404).send({ message: "Invalid username and/or password" });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid username and/or password"
            });
        }

        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 1800 // 24 hours
        });
        const date = new Date();
        User.findByIdAndUpdate(user._id, { token: token, update_date: date, last_login: date }).then(modifiedUser => {
            res.status(200).send({
                id: modifiedUser._id,
                creation_date: modifiedUser.creation_date,
                update_date: date,
                last_login: date,
                token: token
            });
        }).catch((err) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
        });
    });
};