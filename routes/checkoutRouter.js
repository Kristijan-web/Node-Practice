const express = require("express");
const { createSession } = require("../controllers/checkoutSessionController");
const { protect } = require("../controllers/authController");

const checkoutRouter = express.Router();

checkoutRouter.get("/:tourId", protect, createSession);

module.exports = checkoutRouter;
