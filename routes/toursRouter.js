const express = require("express");
const {
  getTours,
  getTour,
  createTour,
  updateTour,
  paramMiddleware,
  DifficultyGuides,
  tourImages,
  resizeTourImages,
} = require("../controllers/toursController");
const { protect, restrictTo } = require("../controllers/authController");
const toursRouter = express.Router();

toursRouter.param("id", paramMiddleware);

toursRouter.get("/", protect, restrictTo("admin"), getTours);
toursRouter.post("/", protect, tourImages, resizeTourImages, createTour);
toursRouter.get("/:id", getTour);
toursRouter.patch("/:id", protect, tourImages, resizeTourImages, updateTour);
toursRouter.get("/difficultyGuides", DifficultyGuides);

module.exports = toursRouter;
