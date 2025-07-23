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
  deleteTour,
} = require("../controllers/toursController");
const { protect, restrictTo } = require("../controllers/authController");
const toursRouter = express.Router();

toursRouter.param("id", paramMiddleware);

toursRouter.get("/", protect, restrictTo("user"), getTours);
toursRouter.get("/:id", getTour);
toursRouter.post("/", protect, tourImages, resizeTourImages, createTour);
toursRouter.patch("/:id", protect, tourImages, resizeTourImages, updateTour);
toursRouter.delete("/:id", deleteTour);
toursRouter.get("/difficultyGuides", DifficultyGuides);

module.exports = toursRouter;
