import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { natsClient } from '../../../nats-client';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus } from '@jnch-microservice-tickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCreatedListener(natsClient.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  // fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  // fake msg obj
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {
    listener,
    ticket,
    data,
    msg
  };
};

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  // reserve ticket by setting orderId
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
