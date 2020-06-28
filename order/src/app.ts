import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser
} from '@jnch-microservice-tickets/common';
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes/index';

const app = express();
// tell express that it is behind a https proxy of ingress-nginx and to trust it
app.set('trust proxy', true);
app.use(json());

// set cookie with JWT, disable cookie encryption and allow https-only cookie
app.use(
  cookieSession({
    signed: false,
    secure: false //process.env.NODE_ENV !== 'test'
  })
);

// set currentUser to request object, need to call before require-auth middleware
app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
