const express = require("express");
const {
  processPayment,
  // sendStripeApiKey,
  validatePayment
} = require("../controllers/paymentController");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

// router.route("/payment/process").post(isAuthenticatedUser, processPayment);
router.route("/create-checkout-session").post(processPayment);
// router.route("/payment/process/validate").post(isAuthenticatedUser, validatePayment);
// router.route("/payment/process/validate").post(validatePayment);

// router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey);

module.exports = router;
