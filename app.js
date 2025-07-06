const express = require("express");
const toursRouter = require("./routes/toursRouter");
const usersRouter = require("./routes/usersRouter");
const AppError = require("./utills/appError");
const globalErrorHandling = require("./controllers/errorController");
const expressRateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("mongo-sanitize");
const hpp = require("hpp");

const app = express();

// Dozvoljava 100 requstova u roku od sat vremena sa jedne ip adrese, i to samo za rute koji pocinju sa /api
const limiter = expressRateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 sat
});

app.use("/api", limiter);

// Helmet sluzi da postavi security headers
app.use(helmet());

// Ne dozvoljava da input sadrzi $ i . znakove, onda korisinik nece moci da ubaci {$gt: ""}
const sanitizeInput = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === "object") sanitizeInput(obj[key]);
    else obj[key] = mongoSanitize(obj[key]);
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
});

// sprecava parametar pollution, slanje vise istih query parametara, naravno ako dozvoljavamo vise parametara onda treba da ih whitelist-ujemo
app.use(hpp());

app.use(express.json({ limit: "10kb" }));

app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

// Ne znam sta radimo kada se ne pogodi ruta
// Napravi global error hanlding middleware i nek on vrati error kroz API

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandling);

module.exports = { app };
