import {
  BasePublisher,
  Subjects,
  TicketCreatedEvent
} from '@jnch-microservice-tickets/common';

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
