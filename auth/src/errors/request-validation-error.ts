import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    // message in super is just for logging purpose
    super('Invalid request parameters');

    // next line only because we are extending a built-in class in TS
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((e) => {
      return {
        message: e.msg,
        field: e.param
      };
    });
  }
}
