const { Schema, model } = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new Schema(
  {
    name: {
      type: 'string',
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'The tour must have at most 40 characters'],
      minlength: [10, 'The tour must have at least 10 characters'],
      validate: {
        validator: (val) => validator.isAlpha(val, ['en-US'], { ignore: ' -' }), //" =" => " " & "-"
        message: 'A tour name must only contain characters between A-Z',
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A maxGroupSize is required'],
    },
    difficulty: {
      type: String,
      required: [true, 'A difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'It cannot be outside of the given options',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be between 1 and 5'],
      max: [5, 'Ratings must be between 1 and 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          //this keyword only works with new Document creation not with updating
          return this.price > value;
        },
        message: 'Price discount ({VALUE}) must be lower than price itself',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  //ALLOWING VIRTUAL PROPERTIES
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Mongoose Virtual properties-----------------------------------------------------------------------------------------
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Mongoode Middleware ------------------------------------------------------------------------------------------------
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milleseconds`);
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

module.exports = model('Tour', tourSchema);
