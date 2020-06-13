import { TicketCreatedListener } from '../ticket-created-listener';
import { natsClient } from '../../../nats-client';
import { TicketCreatedEvent } from '@jnch-microservice-tickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsClient.client);

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'parking',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  };

  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {
    listener,
    data,
    msg
  };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + msg object
  await listener.onMessage(data, msg);

  // assert ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + msg object
  await listener.onMessage(data, msg);

  // assert ack was called
  expect(msg.ack).toHaveBeenCalled();
});
