const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    tourName: {
      type: String,
      required: [true, "Tour name is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[A-Z]/.test(value);
        },
        message: "TourName must start with a capital letter",
      },
    },
    tourCoverImage: {
      type: String,
    },
    tourImages: {
      type: ["String"],
    },
    tours: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Tour must have at least one activity",
      },
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Price must be positive"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (val) {
          return val > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    location: {
      type: String,
      unique: true,
      required: [true, "Location is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be either: easy, medium, or hard",
      },
      required: [true, "Difficulty is required"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Maximum group size is required"],
      min: [1, "Group size must be at least 1"],
    },
    guide: {
      type: String,
      required: [true, "Guide name is required"],
      trim: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("NumberOfTours").get(function () {
  // Vraca koliko tour-ova pripada tour-u
  return this.tours.length;
});

tourSchema.post("aggregate", function (res) {
  // Prikazuje koliko guide-ova sadrzi svaki tour, tour sadrzi niz guidova koji mu pripadaju
  res.forEach((doc) => {
    doc.guideCount = doc.guides?.length || 0;
  });
});

const Tour = mongoose.model("tours", tourSchema);

module.exports = Tour;
