const express = require("express");
const { getUsers, getUser } = require("../controllers/usersController");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-pasword/:token", resetPassword);

userRouter.get("/", getUsers);
userRouter.get("/:id", getUser);

module.exports = userRouter;
