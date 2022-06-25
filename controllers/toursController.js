const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/api-features');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Middlewares --------------------------------------------------------------------------------------------
exports.aliasTopCheapTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//Controllers ---------------------------------------------------------------------------------------------
exports.getAllTours = catchAsync(async (req, res, next) => {
  //Executing the Query -------------------------------------------------------------
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //Sending the response -------------------------------------------------------------
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const selectedTour = await Tour.findById(id);

  if (!selectedTour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(200).json({
    status: 'success',
    // requestedAt: req.requestTime,
    data: {
      selectedTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedTour = await Tour.findByIdAndDelete(id);

  if (!deletedTour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avrgRating: { $avg: '$ratingsAverage' },
        avrgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avrgPrice: -1 },
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      tours: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: plan.length,
    message: {
      plan,
    },
  });
});
