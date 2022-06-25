class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); // Help to remove the stack which pollute the object
  }
}

//TODO: StackTrace or err.stack shows the error directory

module.exports = AppError;
