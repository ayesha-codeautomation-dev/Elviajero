// utils/stripe.ts

import { Stripe } from '@stripe/stripe-js';

export const getStripe = (): Promise<Stripe | null> => {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    return Promise.reject(new Error('Stripe public key is not defined.'));
  }

  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Stripe) {
      resolve(window.Stripe(stripePublishableKey));
    } else {
      // Handle the case where Stripe is not available (perhaps log an error or show a message to the user)
      reject(new Error('Stripe.js is not loaded.'));
    }
  });
};
