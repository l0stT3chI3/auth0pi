class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

// const handleCastError = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}`;
//   return new AppError(message, 404);
// };

// const handleDuplicateError = (err) => {
//   const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
//   const message = `Duplicate field value: ${value}. Please use anothe value!`;
//   return new AppError(message, 400);
// };

// const handleValidationError = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);

//   const message = `Invalid input data. ${errors.join(". ")}`;
//   return new AppError(message, 400);
// };

module.exports.AppError = AppError;
module.exports.sendErrorDev = sendErrorDev;
module.exports.sendErrorProd = sendErrorProd;
// module.exports.handleCastError = handleCastError;
// module.exports.handleDuplicateError = handleDuplicateError;
// module.exports.handleValidationError = handleValidationError;
