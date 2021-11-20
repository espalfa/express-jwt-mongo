const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Phone = db.phone;

exports.findOne = (req, res) => {
    if(!req.params.user_id){
        res.status(400).send({ message: "Bad request, no params found" });
        return;
    }
    User.findOne({
        _id: req.params.user_id
    })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            let token = req.headers["authorization"];
            if(user.token != token.split(" ")[1]){
                res.status(401).send({ message: "Not authorized" });
                return;
            }
            const currentDate = new Date();
            const dateDifference = parseInt(Math.abs(currentDate.getTime() - user.last_login.getTime()) / (1000 * 60) % 60);
            if( dateDifference >= 30){
                res.status(401).send({ message: "Invalid session" });
                return;
            }
            res.status(200).send({
                user: user
            });
        });
};