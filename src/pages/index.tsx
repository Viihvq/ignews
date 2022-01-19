import { GetServerSideProps } from 'next'
import Head from 'next/head'; //Tudo nesse Head vai ser anexado ao Head de _documents

import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './Home.module.scss';

interface HomeProps{
  product:{
    priceId: string,
    amount: number;
  }
}

export default function Home({product}: HomeProps) {
  return (
    <>
      <Head> 
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br/>
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => { //camada node next
  const price = await stripe.prices.retrieve('price_1KJ1jeAwhzs1IwCsIkgSDUM9' , {
    expand: ['product'] //expand dá acesso a todas as infos do produto
  })

  const product = {
    priceId: price.id,  //stripe.com/docs/api/prices/retrieve
    amount: new Intl.NumberFormat('en-US',{
      style:'currency',
      currency: 'USD',
    }).format(price.unit_amount/100), //divide porque vem em centavos
  };

  return { //tudo que retorna de props aqui é mostrada em Home(props) por exemplo.
    props:{
      product,
    }
  }
}