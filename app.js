const express = require('express');
const app = express();
const port = 3003;
const middle = require("./middle");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("./database");
const session = require("express-session");

const server = app.listen(port, () => console.log("Server listening on port " + port));

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    //hash the session for security
    secret: "werd",
    resave: true,
    saveUninitialized: false,
}))

//routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const logoutRoute = require('./routes/logout');

//API routes
const postsAPIRoute = require('./routes/api/posts');
const { post } = require('./routes/loginRoutes');

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/posts", middle.requireLogin, postRoute);
app.use("/profile", middle.requireLogin, profileRoute);
app.use("/logout", logoutRoute);
2
app.use("/api/posts", postsAPIRoute);


//request, response
app.get("/", middle.requireLogin, (req, res, next) => {
    //check if logged in before going to home

    var payload = {
        pageTitle: "Home",
        //information about logged in user displayed on page
        userLoggedIn: req.session.user,
        //to pass as variable between files: stringify
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    res.status(200).render("home", payload);
});

