import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError
} from '@jnch-microservice-tickets/common';
import { Order, OrderStatus } from '../models/order';

const router = express.Router();

/**
 * Update order status to cancel instead of deleting the record => can keep track of all orders
 * a worker job can then run and clear any unwanted orders if needed
 */
router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // need to publish order:cancelled event

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
