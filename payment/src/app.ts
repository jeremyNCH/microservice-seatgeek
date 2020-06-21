import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser
} from '@jnch-microservice-tickets/common';
import { createChargeRouter } from './routes/new';

const app = express();
// tell express that it is behind a https proxy of ingress-nginx and to trust it
app.set('trust proxy', true);
app.use(json());

// set cookie with JWT, disable cookie encryption and allow https-only cookie
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);

// set currentUser to request object, need to call before require-auth middleware
app.use(currentUser);

app.use(createChargeRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
