import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsClient } from '../../nats-client';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId
    })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: 'reserved ticket',
    price: 20
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'radonUserId',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: 'Free ticket',
    price: 20
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  expect(response.body.ticket.id).toEqual(ticket.id);
});

it('emit an order created event', async () => {
  const ticket = Ticket.build({
    title: 'Free ticket',
    price: 20
  });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  expect(natsClient.client.publish).toHaveBeenCalled();
});
