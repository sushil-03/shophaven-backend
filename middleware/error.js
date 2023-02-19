const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  (err.statusCode = err.statusCode || 500),
    (err.message = err.message || "Internal Server Error");

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "JsonWebTokenError") {
    const message = `JSON web token is invalid.Try Again`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = `JSON web token is expired,Try Again`;
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
