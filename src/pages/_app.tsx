// src/pages/_app.tsx

import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const hideLayoutRoutes = ['/auth/login'];

  const shouldHideLayout = hideLayoutRoutes.includes(router.pathname);

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <main className="min-h-screen">
        <Component {...pageProps} />
      </main>
      {!shouldHideLayout && <Footer />}
    </>
  );
}
