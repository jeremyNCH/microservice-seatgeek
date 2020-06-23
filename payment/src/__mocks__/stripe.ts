import mongoose from 'mongoose';
/**
 * Mock stripe.create and resolve an empty promise sincce stripe create returns a promise that we await
 * Mock only the returned stripeId from stripe since it is the only data we need to test
 */
export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: mongoose.Types.ObjectId().toHexString() })
  }
};
