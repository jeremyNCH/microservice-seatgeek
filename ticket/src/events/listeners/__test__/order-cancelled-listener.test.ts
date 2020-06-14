import mongoose from 'mongoose';
import { natsClient } from '../../../nats-client';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledEvent } from '@jnch-microservice-tickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(natsClient.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  });

  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {
    listener,
    data,
    ticket,
    orderId,
    msg
  };
};

it('updates the ticket, publishes an event and acks the message', async () => {
  const { listener, data, ticket, orderId, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsClient.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsClient.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).not.toBeDefined();
});
