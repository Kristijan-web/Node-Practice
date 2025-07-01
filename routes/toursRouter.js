const express = require("express");
const {
  getTours,
  getTour,
  createTour,
  updateTour,
  paramMiddleware,
  DifficultyGuides,
} = require("../controllers/toursController");
const { protect, restrictTo } = require("../controllers/authController");
const toursRouter = express.Router();

toursRouter.param("id", paramMiddleware);

toursRouter.get("/", protect, restrictTo("admin"), getTours);
toursRouter.post("/", createTour);
toursRouter.get("/:id", getTour);
toursRouter.patch("/:id", updateTour);
toursRouter.get("/difficultyGuides", DifficultyGuides);

module.exports = toursRouter;
