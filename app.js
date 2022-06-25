const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();

//Routes --------------------------------------------------------------------------------
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

//Third-party middlewares ----------------------------------------------------------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//Dev middleware --------------------------------------------------------------------------
// app.use((req, res, next) => {
//   // console.log('Middleware working...');
//   // console.log(req.body);
//   next();
// });
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

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
