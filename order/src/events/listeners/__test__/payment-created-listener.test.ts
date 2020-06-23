import mongoose from 'mongoose';
import { OrderStatus, PaymentCreatedEvent } from '@jnch-microservice-tickets/common';
import { natsClient } from '../../../nats-client';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';
import { PaymentCreatedListener } from '../payment-created-listener';

const setup = async () => {
  const listener = new PaymentCreatedListener(natsClient.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.AwaitingPayment,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  const data: PaymentCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    stripeId: new mongoose.Types.ObjectId().toHexString()
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {
    listener,
    order,
    ticket,
    data,
    msg
  };
};

it('updates the order status to complete', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
