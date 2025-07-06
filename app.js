const express = require("express");
const toursRouter = require("./routes/toursRouter");
const usersRouter = require("./routes/usersRouter");
const AppError = require("./utills/appError");
const globalErrorHandling = require("./controllers/errorController");
const expressRateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
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

// Stiti od Cross Site Scripting Napada, cisti user input od HTML-a <div>Cao</div> = !div!Cao@div@
app.use(xssClean());

// Ne dozvoljava da input sadrzi $ i . znakove, onda korisinik nece moci da ubaci {$gt: ""}
app.use(mongoSanitize());

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
module.exports = app;
