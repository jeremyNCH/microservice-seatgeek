import {
  BasePublisher,
  Subjects,
  OrderCreatedEvent
} from '@jnch-microservice-tickets/common';

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
