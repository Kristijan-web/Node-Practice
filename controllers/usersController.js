const User = require("../models/userModel");
const AppError = require("../utills/appError");
const catchAsync = require("../utills/catchAsync");

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

module.exports = { getUsers, getUser };
