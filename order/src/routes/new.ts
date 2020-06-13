import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError
} from '@jnch-microservice-tickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsClient } from '../nats-client';

const router = express.Router();

// 15 mins
const EXPIRATION_WINDOW_SEC = parseInt(process.env.ORDER_EXP_WINDOW!) || 15 * 60;

/**
 * Find the ticket the user is trying to order in the db
 * make sure that this ticket is not already reserved/locked => ticket not associated with any `not cancelled` order
 * set an expiration date for this order
 * create the order and save it to the order db
 * publish order:created event
 */
router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (await ticket.isReserved()) {
      throw new BadRequestError('Ticket is already reserved');
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SEC);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt,
      ticket
    });

    await order.save();

    /**
     * emit order:created event
     * expiresAt should be timezone agnostic -> use ISO/UTC timestamp when manually casting into string
     */
    new OrderCreatedPublisher(natsClient.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
