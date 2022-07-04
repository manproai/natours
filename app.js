const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();

//Routes --------------------------------------------------------------------------------
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

//Dev Dlobal middleware --------------------------------------------------------------------------
// app.use((req, res, next) => {
//   // console.log('Middleware working...');
//   // console.log(req.body);
//   next();
// });
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

//Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Set security http headers
app.use(helmet());

//request limiter
const limiter = rateLimit({
  max: 10,
  windowsMs: 60 * 60 * 1000,
  message: 'Too many request from this device. Please try in an hour',
});

app.use('/api', limiter); // against brute force attack

//parse the request body
app.use(express.json({ limit: '10kb' }));

// data sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());

//prevent param pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//set static files
app.use(express.static(`${__dirname}/public`));

//Routes ------------------------------------------------------------------------------------
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl}`,
  // });
  // const err = new Error(`${req.originalUrl} not found`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`${req.originalUrl} not found`, 404));
});

//error handling -----------------------------------------------------------------------------
app.use(errorHandler);

//export ------------------------------------------------------------------------------------
module.exports = app;
