import '@/styles/globals.css'
import { AuthContextProvider } from '@/context/AuthContext';
import Head from 'next/head';
import '@/styles/marker.css'



export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Routourist</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    </>
  )
}
