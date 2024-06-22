class ErrorHandler extends Error {
  constructor(message, status) {
    super(message);
    this.message = message;
    this.statusCode = status;
  }
}

module.exports = ErrorHandler;
