const express = require("express");
const {
  createOrder,
  singleOrder,
  myOrders,
  getAllOrder,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");
const router = express.Router();

const { isAuthenticated, authorizeRole } = require("../middleware/auth");

router.route("/order/new").post(isAuthenticated, createOrder);

router.route("/order/:id").get(isAuthenticated, singleOrder);

router.route("/orders/me").get(isAuthenticated, myOrders);

router
  .route("/admin/orders")
  .get(isAuthenticated, authorizeRole("admin"), getAllOrder);

router
  .route("/admin/order/:id")
  .put(isAuthenticated, authorizeRole("admin"), updateOrder)
  .delete(isAuthenticated, authorizeRole("admin"), deleteOrder);
module.exports = router;
