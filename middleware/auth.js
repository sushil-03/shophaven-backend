const ErrorHandler = require("../utils/errorHandler");
const asyncError = require("./asyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticated = asyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(
            new ErrorHandler("Please login to access the resource"),
            401
        );
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
});

// Checking Admin or not
exports.authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role ${req.user.role} is not allowed to access`
                ),
                403
            );
        }
        next();
    };
};
