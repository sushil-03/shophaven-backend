const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const AsyncError = require("../middleware/asyncError");

//Create new Order
exports.createOrder = AsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(201).json({
    success: true,
    order,
  });
});

//Get Single Order
exports.singleOrder = AsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with this id"), 404);
  }

  res.status(201).json({
    success: true,
    order,
  });
});

//Get Logged in user order (User order)
exports.myOrders = AsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  if (!orders) {
    return next(new ErrorHandler("No order found"), 404);
  }

  res.status(201).json({
    success: true,
    orders,
  });
});

//Get All order --admin
exports.getAllOrder = AsyncError(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  if (!orders) {
    return next(new ErrorHandler("No order found"), 404);
  }

  res.status(201).json({
    success: true,
    orders,
    totalAmount,
  });
});

async function updateStock(quantity, id) {
  const product = await Product.findById(id);
  product.Stock -= quantity;
  await product.save({
    validateBeforeSave: false,
  });
}

//Update Order Status --admin
exports.updateOrder = AsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler(`Order not found with this id`), 401);
  }
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler(`Your order is already Delivered`), 400);
  }
  // const { status } = req.body;
  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (item) => {
      await updateStock(item.quantity, item.product_id);
    });
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save({
    validateBeforeSave: false,
  });

  res.status(201).json({
    success: true,
    order,
  });
});
//Delete Order --admin
exports.deleteOrder = AsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  order.remove();
  res.status(201).json({
    success: true,
    order,
  });
});
