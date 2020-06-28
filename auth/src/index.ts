import mongoose, { mongo } from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('Auth-srv starting up......');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    process.on('unhandledRejection', (reason, p) => {
      // @ts-ignore
      console.log('Unhandled Rejection at: Promise', p, 'reason:', reason.stack);
      // application specific logging, throwing an error, or other logic here
    });

    console.log('Connected to mongodb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000...');
  });
};

start();
