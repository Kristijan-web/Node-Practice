const User = require("../models/userModel");
const AppError = require("../utills/appError");
const catchAsync = require("../utills/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const filterBody = require("../utills/filterBody");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // stavi gde ce fajlovi da se cuvaju
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     // napravi niz fajla pod kojim ce slika da se cuva
//     const extension = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

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

const multerUpload = upload.single("photo");

const resizeImage = function (req, res, next) {
  if (!req.file) {
    return next();
  }
  // resizuj sliku

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    message: "success",
    data: {
      users,
    },
  });
});

const getUser = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.params.id);
  if (!user) {
    // ovo ce direktno poslati gresku global error handler i time je operational
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    message: "success",
    data: {
      user,
    },
  });
});

const updateUser = catchAsync(async function (req, res, next) {
  // 1. Proveri da li je slicajno poslat password ako jeste posalji gresku koja  kaze da ovo nije endpoint za to

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  // 2. Filtiraj body tako da postoje samo polja koja su dozovoljena za update
  const filteredBody = filterBody(req.body, "name", "email");
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  // 3. Updatuj user-a
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  // ovaj endpoint poziva user klikom na dugme
  // brisanje usera je setovanje polja active na false
  // dohvati usera na osnovu id-a

  await User.findByIdAndUpdate(req.user.id, {
    active: "false",
  });

  res.status(204).json({
    status: "success",
    data: {
      user: null,
    },
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  multerUpload,
  resizeImage,
};
