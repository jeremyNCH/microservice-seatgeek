import {
  PaymentCreatedEvent,
  BaseListener,
  Subjects,
  OrderStatus
} from '@jnch-microservice-tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends BaseListener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete
    });
    await order.save();

    /**
     * Technically, order.version is incremented on save() above
     * Hence, we need an order:updated publisher and event or we will have version conflicts
     * However, since we do NOT expect a complete order to change as it is its final form, this order:updated is not not required
     */

    msg.ack();
  }
}
