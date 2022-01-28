import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb';
import { getSession } from 'next-auth/react';
import { fauna } from '../../services/fauna';
import { stripe } from '../../services/stripe';

type User = {
  ref: {
    id: string
  }
  data: {
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST'){
    const session = await getSession({ req }); //pega as informações dos cookies

    const user = await fauna.query<User>( //pega o email do user logado
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id;

    if(!customerId){ //se o user não tiver o stripeCustomerId no fauna, salva o email no stripe e atualiza o user do fauna
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        //metadata
      })

      await fauna.query( //Att no fauna com um id do stripe
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id,
            }
          }
        )
      )

      customerId = stripeCustomer.id
    }



    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, // != id do fauna
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