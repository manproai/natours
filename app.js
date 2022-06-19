const express = require('express');
const morgan = require('morgan');

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
app.use((req, res, next) => {
  // console.log('Middleware working...');
  // console.log(req.body);
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routes ------------------------------------------------------------------------------------
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//export ------------------------------------------------------------------------------------
module.exports = app;
