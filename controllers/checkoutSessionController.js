const Tour = require("../models/toursModel");
const AppError = require("../utills/appError");
const catchAsync = require("../utills/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}`,
    cancel_url: `${req.protocol}://${req.get("host")}`,
    mode: "payment",
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          unit_amount: tour.totalPrice,
          currency: "usd",
          product_data: {
            name: `${tour.tourName} tour`,
            description: "High-quality tour",
            images: [
              `https://res.cloudinary.com/worldpackers/image/upload/c_limit,f_auto,q_auto,w_1140/wf539dougrbeepsbesye`,
            ],
          },
        },

        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

module.exports = { createSession };
