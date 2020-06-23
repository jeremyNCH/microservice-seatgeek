import {
  PaymentCreatedEvent,
  Subjects,
  BasePublisher
} from '@jnch-microservice-tickets/common';

export class PaymentCreatedPublisher extends BasePublisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
