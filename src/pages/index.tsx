import Head from 'next/head'; //Tudo nesse Head vai ser anexado ao Head de _documents
export default function Home() {
  return (
    <>
      <Head> 
        <title>Início | ig.news</title>
      </Head>
      <h1>
        Hello World
      </h1>
    </>
  )
}
