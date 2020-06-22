/**
 * Mock stripe.create and resolve an empty promise sincce stripe create returns a promise that we await
 */
export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({})
  }
};
