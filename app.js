const express = require("express");
const toursRouter = require("./routes/toursRouter");
const usersRouter = require("./routes/usersRouter");
const AppError = require("./utills/appError");
const globalErrorHandling = require("./controllers/errorController");
const app = express();

app.use(express.json());

app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

// Ne znam sta radimo kada se ne pogodi ruta
// Napravi global error hanlding middleware i nek on vrati error kroz API

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandling);
module.exports = app;
