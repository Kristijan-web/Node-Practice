const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utills/catchAsync");
const AppError = require("../utills/appError");

const tokenJWT = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const login = catchAsync(async (req, res, next) => {
  // prvo da dohvatimo usera za prosledjeni email

  const user = await User.findOne({}).select("+password");
  // sada pravimo instance method za proveru sifre
  if (!user || !(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = tokenJWT(user._id);
  res.json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = tokenJWT(newUser._id);

  res.status(200).json({
    message: "success",
    token,
    data: {
      newUser,
    },
  });
});

// pa sada treba da se napravi middleware za autorizaciju

const protect = catchAsync(async (req, res, next) => {
  // THIS IS AUTHENTICATION
  // provera da li je korisnik ulogovan

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in!", 401));
  }

  // validacija tokena

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Sta ako je korisnik obrisan a JWT token jos postoji kod njega?

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // sta ako je korisniku ukraden jwt token i on te iste sekunde promeni sifru, da li ce stari jwt token biti validan?

  const isPasswordChanged = currentUser.changedPassword(decoded.iat);

  if (isPasswordChanged) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  req.user = currentUser; // sada imamo korisnika u requestu i mozemo da ga koristimo u daljim middleware-ima
  next();
});

const restrictTo = function (...roles) {
  return (req, res, next) => {
    // uzmi role iz req.user i proveri da li ima dozvolu da pristupi ruti
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to access", 403));
    }
    next();
  };
};

// napravi funkciju forgotPassword i resetPassword

const forgotPassword = catchAsync(async (req, res, next) => {
  // korisnik prosledjuje email preeeeeeko body-a

  const user = await User.findOne({ email: req?.body?.email });
  if (!user) {
    return next(new AppError("User does not exist", 404));
  }
  // treba neko da save-ujem u bazi podatke koji si izmenjeni
  const resetToken = user.createUserToken();

  await user.save({ validateBeforeSave: false });
  // sada kada vidim da user postoji pravim token koristeci instance method
  res.status(200).json({
    message: "success",
    data: {
      resetToken,
    },
  });
});

const resetPassword = function (req, res, next) {};

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
};
