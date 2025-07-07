const Tour = require("../models/toursModel");
const tourModel = require("../models/toursModel");
const ApiFeatures = require("../utills/apiFeatures");
const AppError = require("../utills/appError");
const multer = require("multer");
const sharp = require("sharp");
const filterBody = require("../utills/filterBody");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // ovde je cilj da se potvrdi da je u pitanju slika a ne neki fajl
  if (file.mimetype.startsWith("image")) {
    // prvi parametar sluzi da se prosledi greska ali ako je korisnik stvarno prosledio sliku onda stavljam null koji znaci da nema greske
    cb(null, true);
  } else {
    cb(new AppError("Provided file is not an image", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const tourImages = upload.fields([
  {
    name: "tourCoverImage",
    max: 1,
  },
  {
    name: "tourImages",
    max: 3,
  },
]);

const resizeTourImages = catchAsync(async (req, res, next) => {
  const tourCoverImage = req?.files?.tourCoverImage[0];
  const tourImages = req?.files?.tourImages;

  if (!tourCoverImage || !tourImages) {
    return next();
  }

  // obe konstante cuvaju niz

  tourCoverImage.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(tourCoverImage.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${tourCoverImage.filename}`);

  Promise.all(
    tourImages.map(async (image) => {
      image.filename = `tour-${req.user.id}-${Date.now()}-${i}.jpeg`;
      await sharp(image.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${image.filename}`);
    })
  );

  next();
});

// Funkcija prebacena u utills/apiFeatures
// function parseQuery(query) {
//   delete query.sort;
//   const mongoQuery = {};
//   for (const key in query) {
//     const match = key.match(/(\w+)\[(\w+)\]/);
//     if (match) {
//       const field = match[1];
//       const operator = `$${match[2]}`;
//       if (!mongoQuery[field]) mongoQuery[field] = {};
//       mongoQuery[field][operator] = Number(query[key]);
//     } else {
//       mongoQuery[key] = Number(query[key]) || query[key];
//     }
//   }
//   return mongoQuery;
// }

function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
}

function paramMiddleware(req, res, next, value) {
  if (value > 10) res.send("Value must be under 10");
  next();
}

const getTours = catchAsync(async (req, res, next) => {
  // I NACIN

  // const filterParams = parseQuery(req.query);
  // const sortingParams = req.query.sort
  //   ? req.query.sort.split(",").join(" ")
  //   : null;

  // let query = tourModel.find();

  // query = query.find(filterParams).sort(sortingParams);

  // const tours = await query;

  // II NACIN - BOLJI

  const apiFeatures = new ApiFeatures(tourModel.find(), req.query);
  const features = apiFeatures.filter().sort().limitFields().paginate();
  const tours = await features.query;

  /// III nacin - koriscnejem aggregate funckije -> DifficultyGuides funkcija u ovom fajlu

  res.status(200).json({
    status: "success",
    data: {
      tours,
    },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const singleTour = await Tour.findById(req.params.id);

  if (!singleTour) {
    return next(new AppError("Specified tour does not exist", 404));
  }

  res.status(200).json({
    message: "success",
    data: {
      singleTour,
    },
  });
});

const createTour = catchAsync(async (req, res, next) => {
  console.log(req.files.tourCoverImage[0].filename);
  const filteredBody = filterBody(
    req.body,
    "tourName",
    "tourCoverImage",
    "tourImages",
    "totalPrice",
    "guide",
    "location",
    "difficulty",
    "maxGroupSize",
    "startdate",
    "endDate",
    "tours"
  );
  if (req.files) {
    (req.body.tourCoverImage = req.files.tourCoverImage[0].filename),
      (req.body.tourImages = req.files.tourImages);
  }

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const filteredBody = filterBody(
    req.body,
    "tourName",
    "tourCoverImage",
    "tourImages",
    "totalPrice"
  );
  if (req.files) {
    (req.body.tourCoverImage = req.files.tourCoverImage[0].filename),
      (req.body.tourImages = req.files.tourImages);
  }
  const updatedTour = await tourModel.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedTour) {
    return next(new AppError("Specified tour does not exist", 404));
  }

  res.status(201).json({
    message: "success",
    data: {
      updatedTour,
    },
  });
});

async function DifficultyGuides(req, res) {
  // grupisi po difficulty i prikazi sve tourGuide-ove koji pripadaju tom difficulty-u
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: "$difficulty",
        totalPrice: {
          $sum: "$totalPrice",
        },

        guides: {
          $push: "$guide",
        },
      },
    },
    {
      $addFields: {
        difficulty: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    message: "success",
    data: stats,
  });
}

module.exports = {
  getTours,
  getTour,
  createTour,
  updateTour,
  paramMiddleware,
  DifficultyGuides,
  tourImages,
  resizeTourImages,
};
