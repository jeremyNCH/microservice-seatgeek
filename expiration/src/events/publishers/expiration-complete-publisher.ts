import {
  BasePublisher,
  Subjects,
  ExpirationCompleteEvent
} from '@jnch-microservice-tickets/common';

export class ExpirationCompletePublisher extends BasePublisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
