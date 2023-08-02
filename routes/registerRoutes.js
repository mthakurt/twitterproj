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

    res.status(200).render("register");
})

router.post("/", async (req, res, next) => {

    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password) {
        //validate unique user and password using a query. await ensures this block of code runs first
        var user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .catch((err)=> {
            console.log(err);
            payload.errorMessage = "Error: something went wrong."
            res.status(200).render("register", payload);
        });
        if(user == null) {
            //username doesn't exist, insert this user data
            var data = req.body;

            //hash password for encrpytion
            data.password = await bcrypt.hash(password, 9);
            User.create(data)
            .then((user)=> {
                //save current user session
                req.session.user = user;
                //redirect to the homepage
                return res.redirect("/");
            })

        }
        else{
            //username already exists
            if(email = user.email) {
                payload.errorMessage = "email is linked to another account."
            }
            else {
                payload.errorMessage = "username is linked to another account.."
            }
            res.status(200).render("register", payload);
        }

    }
    else {
        payload.errorMessage = "Invalid values in fields. Please enter valid values"
        res.status(200).render("register", payload);
    }

})

module.exports = router;

