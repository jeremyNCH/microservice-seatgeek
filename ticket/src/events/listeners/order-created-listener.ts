import {
  BaseListener,
  OrderCreatedEvent,
  Subjects
} from '@jnch-microservice-tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // mark ticket as reserved by adding orderId
    ticket.set({
      orderId: data.id
    });
    await ticket.save();

    msg.ack();
  }
}
