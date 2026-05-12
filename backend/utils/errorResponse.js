/**
 * Custom Error class that extends the built-in Error.
 * Allows attaching an HTTP status code to errors.
 *
 * Usage: throw new ErrorResponse("Not found", 404);
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
