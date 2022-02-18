const express = require("express");
const Router = express.Router();
const auth = require("../Controller/auth");
const authenticate = require("../Controller/misc/user-auth");
//GET requests

Router.get("/verify/:token", auth.verify);
Router.get("/user", authenticate, auth.detail);
Router.get("/logout", authenticate, auth.logout);

//POST requests
Router.post("/signup", auth.signup);
Router.post("/login", auth.login);
Router.post("/forgot/:token", auth.changePassword);
Router.post("/forgot", auth.forGet);
Router.post("/reset", authenticate, auth.ResetDetails);

module.exports = Router;
