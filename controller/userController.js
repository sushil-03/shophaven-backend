const ErrorHandler = require("../utils/errorHandler");
const AsyncError = require("../middleware/asyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/getJWTtoken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
//Register a User
exports.registerUser = AsyncError(async (req, res, next) => {
  let myCloud;
  if (req.body.avatar !== "/profile.png") {
    myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
  }
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud ? myCloud.public_id : "no-image",
      // url: myCloud ? myCloud.secure_url : "/profile2.png",
      url: myCloud
        ? myCloud.secure_url
        : "https://res.cloudinary.com/dlv5hu0eq/image/upload/v1655021406/basicData/profile2_muu58h.png",
    },
  });
  sendToken(user, 201, res);
});

// log in
exports.loginUser = AsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password"), 400);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password"), 401);
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password"), 401);
  }

  sendToken(user, 200, res);
});

//LogOut user
exports.logoutUser = AsyncError(async (req, res, next) => {
  res.cookie("shophaventoken", null, {
    expires: new Date(Date.now()),
  });
  return res.status(200).json({
    success: true,
    message: "Logged Out successfully",
  });
});

//Forgot Password
exports.forgotPassword = AsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler(`User Not found `, 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}.         
   If you have not requested this email, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message), 500);
  }
});

//Reset Password
exports.resetPassword = AsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        `Reset Password token in invalid or has been  expired`,
        404
      )
    );
  }
  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler(`Password doesn't match`, 404));
  }
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  sendToken(user, 200, res);
});

//Get User details
exports.getUserDetails = AsyncError(async (req, res, next) => {
  console.log("REACHED USER");
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User Password
exports.updatePassword = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is incorrect"), 401);
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match"), 401);
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

//Update User Profile
exports.updateProfile = AsyncError(async (req, res, next) => {
  const updateData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findById(req.user.id);
  if (req.body.avatar != user.avatar.url) {
    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 350,
    });
    updateData.avatar = {
      public_id: myCloud ? myCloud.public_id : "no-image",
      // url: myCloud ? myCloud.secure_url : "/profile2.png",
      url: myCloud
        ? myCloud.secure_url
        : "/https://res.cloudinary.com/dlv5hu0eq/image/upload/v1655021406/basicData/profile2_muu58h.png",
    };
  }

  await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});
//Update User Role
exports.updateUserRole = AsyncError(async (req, res, next) => {
  const updateData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  console.log(updateData);
  await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Role Upated",
  });
});

//Delete User
exports.deleteUser = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User doesn't exist${req.params.id}`), 400);
  }

  const imageId = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);
  await user.remove();
  res.status(200).json({
    success: true,
    message: `User has removed`,
  });
});
//Get all user
exports.getAllUser = AsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//Get single user
exports.getSingleUser = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User must sign in first`), 400);
  }
  res.status(200).json({
    success: true,
    user,
  });
});
