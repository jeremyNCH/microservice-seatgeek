import {
  BasePublisher,
  Subjects,
  TicketUpdatedEvent
} from '@jnch-microservice-tickets/common';

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
