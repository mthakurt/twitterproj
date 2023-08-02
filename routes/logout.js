const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");
const bcrypt = require("bcrypt");


app.use(bodyParser.urlencoded({ extended: false }));

//request, response
router.get("/", (req, res, next) => {
    //end session and send user to login
    if(req.session) {
        req.session.destroy(() => {
            res.redirect("/login");
        })
    }
})

module.exports = router;