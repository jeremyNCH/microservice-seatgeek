import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Failed to connect to database';

  constructor() {
    // message in super is just for logging purpose
    super('Error connecting to db');

    // next line only because we are extending a built-in class in TS
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
