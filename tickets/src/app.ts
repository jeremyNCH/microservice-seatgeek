import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@jnch-microservice-tickets/common';

const app = express();
// tell express that it is behind a https proxy of ingress-nginx and to trust it
app.set('trust proxy', true);
app.use(json());

// disable cookie encryption and allow https-only cookie
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
