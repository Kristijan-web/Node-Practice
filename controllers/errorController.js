const AppError = require("../utills/appError");

function handleInvalidTokenError() {
  const message = "Invalid token, please log in again";
  return new AppError(message, 401);
}

function handleExpiredTokenError() {
  const message = "Token expired, please log in again";
  return new AppError(message, 401);
}

function handleIDErrorDB(error) {
  const message = `for ${error.path} value: ${error.value} is not valid`;
  return new AppError(message, 404);
}

function handleDuplicateErrorDB(error) {
  error.duplicateValues = [];

  for (let key in error.keyValue) {
    error.duplicateValues.push(error.keyValue[key]);
  }

  const message = `Value must be unique, found duplicate: ${error.duplicateValues[0]}`;
  return new AppError(message, 401);
}

function handleValidationErrorDB(error) {
  const message = `${error.message}`;
  return new AppError(message, 400);
}

function sendErrorDevelopment(error, res) {
  console.log(error);
  res.status(400).json({
    error: error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
}

function sendErrorProduction(error, res) {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: `${error.message}`,
    });
  } else {
    // PROGRAMATIC ERROR
    // za ispis u conzoli za hostovanje

    console.error(`${new Date().toISOString()}, ${error}`);
    res.status(404).json({
      message: "error, contact developer",
    });
  }
}

const globalErrorHandling = (err, req, res, next) => {
  // SETTING DEFAULT VALUES
  err.status ? err.status : "fail";
  err.statusCode ? err.statusCode : 500;

  if (process.env.NODE_ENV === "development") {
    sendErrorDevelopment(err, res);
  } else {
    let error = {
      ...err,
      name: err.name || "",
      ...(err.message && { message: err.message }),
    };
    // ALL 3 IF'S ARE FOR ERRORS MADE BY MONGOOSE
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }

    if (error.path === "_id") {
      error = handleIDErrorDB(error);
    }

    if (error.name === "TokenExpiredError") {
      error = handleExpiredTokenError();
    }

    if (error.name === "JsonWebTokenError") {
      error = handleInvalidTokenError();
    }

    sendErrorProduction(error, res);
  }
};

module.exports = globalErrorHandling;
