export class DatabaseConnectionError extends Error {
  reason = 'Failed to connect to database';

  constructor() {
    super();

    // next line only because we are extending a built-in class in TS
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
}
