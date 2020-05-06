import { ValidationError } from 'express-validator';

export class RequestValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super();

    // next line only because we are extending a built-in class in TS
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}
