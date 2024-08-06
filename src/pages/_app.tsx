import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function MyApp({ Component, pageProps }: AppProps) {
  const [locale, setLocale] = useState('en')

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} setLocale={setLocale} />
      <main className="flex-grow">
        <Component {...pageProps} locale={locale} setLocale={setLocale} />
      </main>
      <Footer locale={locale} />
    </div>
  )
}

export default MyApp