import {
  BasePublisher,
  Subjects,
  OrderCancelledEvent
} from '@jnch-microservice-tickets/common';

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
