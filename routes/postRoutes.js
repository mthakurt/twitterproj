const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");
const bcrypt = require("bcrypt");

//request, response
router.get("/:id", (req, res, next) => {
    //check if logged in before going to home
    res.status(200).render("login");

    var payload = {
        pageTitle: "View Post",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.id
    }

    res.status(200).render("postPage", payload);
})

module.exports = router;