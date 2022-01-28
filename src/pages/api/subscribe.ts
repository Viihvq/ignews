import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react';
import { stripe } from '../../services/stripe';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST'){
    const session = await getSession({ req }); //pega as informações dos cookies

    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
      //metadata
    })

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id, // != id do fauna
      payment_method_types: ['card'],
      billing_address_collection: 'required', //endereço
      line_items: [
        {price: 'price_1KJ1jeAwhzs1IwCsIkgSDUM9', quantity: 1}
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return res.status(200).json({ sessionId: stripeCheckoutSession.id})

  }else{
    res.setHeader('Allow', 'POST'); //Explica que o método aceito é POST
    res.status(405).end('Method not allowed');
  }
}