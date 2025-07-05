const User = require("../models/userModel");
const AppError = require("../utills/appError");
const catchAsync = require("../utills/catchAsync");

function filterBody(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
}

const getUsers = catchAsync(async function (req, res, next) {
  const users = await User.find();

  res.status(200).json({
    message: "success",
    data: {
      users,
    },
  });
});

const getUser = catchAsync(async function (req, res, next) {
  console.log(req.params);
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

module.exports = { getUsers, getUser, updateUser, deleteUser };
