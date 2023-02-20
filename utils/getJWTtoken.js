//Creating token and saving  in cookie
const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    //option for cookies
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        // domain: "http://localhost:3000",
        httpOnly: true,
        // secure: true,
        // sameSite: "none",
        // credentials: "same-origin",
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;
