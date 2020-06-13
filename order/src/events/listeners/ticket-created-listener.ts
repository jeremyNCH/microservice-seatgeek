import { Message } from 'node-nats-streaming';
import {
  Subjects,
  BaseListener,
  TicketCreatedEvent
} from '@jnch-microservice-tickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({
      id,
      title,
      price
    });

    await ticket.save();

    msg.ack();
  }
}
