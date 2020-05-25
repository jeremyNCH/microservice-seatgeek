import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser
} from '@jnch-microservice-tickets/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { updateTicketRouter } from './routes/update';
import { indexTicketRouter } from './routes/index';

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter);
app.use(indexTicketRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
