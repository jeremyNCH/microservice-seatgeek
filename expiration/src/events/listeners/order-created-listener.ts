import {
  BaseListener,
  OrderCreatedEvent,
  Subjects
} from '@jnch-microservice-tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    // add the job to the queue in redis which will be processed after delay of 15 mins (expiresAt)
    await expirationQueue.add(
      {
        orderId: data.id
      },
      {
        delay
      }
    );

    msg.ack();
  }
}
