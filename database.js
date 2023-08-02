const mongoose = require("mongoose");


class Database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect("link hidden for security reasons")
        .then(() =>  {
            console.log("Database connection successful");
        })
        .catch((err) =>  {
            console.log("Database connection error" + err);
        })
    }
}

module.exports = new Database();
