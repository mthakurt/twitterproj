const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");
const bcrypt = require("bcrypt");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

//request, response
router.get("/", (req, res, next) => {
    //check if logged in before going to home
    res.status(200).render("login");
})

router.post("/", async (req, res, next) => {

    var payload = req.body;

    if(req.body.logUsername && req.body.logPassword) {
        //check if user and email exists
        var user = await User.findOne({
            $or: [
                { username: req.body.logUsername },
                { email: req.body.logUsername }
            ]
        })
        .catch((err)=> {
            console.log(err);
            payload.errorMessage = "Something went wrong."
            res.status(200).render("login", payload);
        });

        if(user != null) {
            //verify password is also correct
            //first encrpyt password
            var result = await bcrypt.compare(req.body.logPassword, user.password)
            if(result === true) {
                //login user and send to home page
                req.session.user = user;
                return res.redirect("/");
            }
        }

        payload.errorMessage = "Login credentials incorrect."
        return res.status(200).render("login", payload);
    }

    payload.errorMessage = "Make sure each field has a valid value."
    res.status(200).render("login");
})

module.exports = router;