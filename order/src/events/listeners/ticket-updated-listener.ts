import { Message } from 'node-nats-streaming';
import {
  Subjects,
  BaseListener,
  TicketUpdatedEvent
} from '@jnch-microservice-tickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends BaseListener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = await Ticket.findByEvent(data);

    // if ticket with previous version not found, this current event arrived to soon and is out of order
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({
      title,
      price
    });
    await ticket.save();

    msg.ack();
  }
}
