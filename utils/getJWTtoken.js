//Creating token and saving  in cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  //option for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // httpOnly: true,
    // path: "/",
    secure: true,
    // secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    // sameSite: "none",
    // credentials: "same-origin",
  };
  // if (process.env.NODE_ENV === "production") options.secure = true;

  res.status(statusCode).cookie("shophaventoken", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
