const express = require("express");
const {
  getUsers,
  getUser,
  updateUser,
} = require("../controllers/usersController");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require("../controllers/authController");
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.patch("/update-password", updatePassword);
userRouter.patch("/updateUser", protect, updateUser);

userRouter.get("/", getUsers);
userRouter.get("/:id", getUser);

module.exports = userRouter;
