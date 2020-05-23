import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

const title = 'nice title';
const price = 20;

const createTicket = (cookie?: any) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', cookie || global.signin())
    .send({
      title,
      price
    });
};

const getTicket = (id: string) => {
  return request(app).get(`/api/tickets/${id}`);
};

const putTicket = (id: string, title: string, price: number, cookie?: any) => {
  return request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie || global.signin())
    .send({
      title,
      price
    });
};

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await putTicket(id, title, price).expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title,
      price
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await createTicket().expect(201);

  await putTicket(response.body.id, 'updated title', 30).expect(401);

  const retrivedTicket = await getTicket(response.body.id).expect(200);

  expect(retrivedTicket.body.title).toEqual(title);
  expect(retrivedTicket.body.price).toEqual(price);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();

  const response = await createTicket(cookie).expect(201);

  await putTicket(response.body.id, '', 20, cookie).expect(400);
  await putTicket(response.body.id, 'updated title', -10, cookie).expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin();

  const response = await createTicket(cookie).expect(201);

  await putTicket(response.body.id, 'updated title', 100, cookie).expect(200);

  const updatedResponse = await getTicket(response.body.id);

  expect(updatedResponse.body.title).toEqual('updated title');
  expect(updatedResponse.body.price).toEqual(100);
});
