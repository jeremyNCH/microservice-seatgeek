import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/custom-error';

// error handling middleware -> identified by express when the middleware has 4 input parameters
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(400).send({
    errors: [
      {
        message: err.message || 'Something went wrong'
      }
    ]
  });
};
