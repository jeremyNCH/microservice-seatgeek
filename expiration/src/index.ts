import { natsClient } from './nats-client';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  console.log('Auth-srv starting up....');

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if (!process.env.REDIS_HOST) {
    throw new Error('REDIS_HOST must be defined');
  }

  try {
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsClient.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => natsClient.client.close());
    process.on('SIGTERM', () => natsClient.client.close());

    process.on('unhandledRejection', (reason, p) => {
      // @ts-ignore
      console.log('Unhandled Rejection at: Promise', p, 'reason:', reason.stack);
      // application specific logging, throwing an error, or other logic here
    });

    new OrderCreatedListener(natsClient.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
