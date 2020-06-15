import Queue from 'bull';
import { natsClient } from '../nats-client';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
});

// process the job from redis once expiresAt is completed
expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsClient.client).publish({
    orderId: job.data.orderId
  });
});

export { expirationQueue };
