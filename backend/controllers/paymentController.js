const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const Razorpay = require("razorpay");
// const crypto = require("crypto");

// // const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// // exports.processPayment = catchAsyncErrors(async (req, res, next) => {
// //   const myPayment = await stripe.paymentIntents.create({
// //     amount: req.body.amount,
// //     currency: "inr",
// //     metadata: {
// //       company: "Ecommerce",
// //     },
// //   });

// //   res
// //     .status(200)
// //     .json({ success: true, client_secret: myPayment.client_secret });
// // });

// // exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
// //   res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
// // });

// exports.processPayment = catchAsyncErrors(async (req, res) => {
//   try {
//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_SECRET,
//     });

//     const options = req.body;
//     const order = await razorpay.orders.create(options);

//     if (!order) {
//       return res.status(500).send("Error");
//     }

//     res.json(order);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error");
//   }
// })
// exports.validatePayment = catchAsyncErrors(async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;

//   const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
//   //order_id + "|" + razorpay_payment_id
//   sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//   const digest = sha.digest("hex");
//   if (digest !== razorpay_signature) {
//     return res.status(400).json({ msg: "Transaction is not legit!" });
//   }

//   res.json({
//     msg: "success",
//     orderId: razorpay_order_id,
//     paymentId: razorpay_payment_id,
//   });
// })
const Order = require('../models/Order.js')
const stripe = require('stripe')('sk_test_51OKlibFTBEHW1myd4lyUjD2gNh9QwoPctXRSZVNWLnUphm0BOWAV6Hpz8hHiM2WkZ6tjpRQbT66EmwXfDmEhGSph00Crkio1RV');
exports.processPayment = catchAsyncErrors(async (req, res) => {
  try {

    if (isValidRequest(req.body)) {
      const line_items = createLineItems(req.body.data.cartItems);
    
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
      });

     const order = new Order({
        shippingInfo: {
          address: req.body.data.shippingInfo.address,
          city: req.body.data.shippingInfo.city,
          state: req.body.data.shippingInfo.state,
          country: req.body.data.shippingInfo.country,
          pinCode: req.body.data.shippingInfo.pinCode,
          phoneNo: req.body.data.shippingInfo.phoneNo,
        },
        orderItems: req.body.data.cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          product: item.product,
        })),
        user: req.body.data.user,
        paymentInfo: {
          id: session.id,
          status: 'pending',
        },
        paidAt: Date.now(),
        itemsPrice: req.body.data.cartItems.price,
        taxPrice: req.body.data.tax,
        shippingPrice: req.body.data.shippingCharges,
        totalPrice: req.body.data.totalPrice,
        orderStatus: 'Processing',
      });
      await order.save();
      res.json({ url: session.url });
    } else {
      res.status(400).json({ error: 'Invalid request. Please provide user and cartItems in the request body.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
})

function isValidRequest(body) {
  return body && body.data && body.data.user && body.data.cartItems && Array.isArray(body.data.cartItems) && body.data.cartItems.length > 0;
}
 
function createLineItems(cartItems) {
  if (!Array.isArray(cartItems)) {
    cartItems = [cartItems]; 
  }

  return cartItems.map((item) => ({
    price_data: {
      currency: 'inr', 
      product_data: {
        name: item.name,
        images: [item.image], 
        metadata: {
          id: item._id,
        },
      },
      unit_amount: item.price
    },
    quantity: item.stock,
  }));
}



