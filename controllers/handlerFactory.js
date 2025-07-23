const AppError = require("../utills/appError");
const catchAsync = require("../utills/catchAsync");

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("Document with that id does not exist", 404));
    }

    res.status(204).json({});
  });

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const filteredBody = filterBody(
    //   req.body,
    //   "tourName",
    //   "tourCoverImage",
    //   "tourImages",
    //   "totalPrice",
    //   "guide",
    //   "location",
    //   "difficulty",
    //   "maxGroupSize",
    //   "startdate",
    //   "endDate",
    //   "tours"
    // );
    if (req.files) {
      filteredBody.tourCoverImage = req.files.tourCoverImage[0].filename;
      // ovde ispod mora niz
      const tourImagesNames = [];
      req.files.tourImages.forEach((image) => {
        tourImagesNames.push(image.filename);
      });

      filteredBodytourImages = tourImagesNames;
    }

    // Mora da vidi kako da se zna da li create-a usera ili tour
    const newTour = await Tour.create(filteredBody);

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  });

module.exports = { deleteOne };
