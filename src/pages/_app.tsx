// pages/_app.tsx
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../app/globals.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '@/redux/store/store';
import { ToastProvider } from 'arzu-toast-modal'; // ✨ ToastProvider'ı import edin

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    const hideLayoutRoutes = ['/auth/login', '/auth/register', '/auth/forgotpassword', '/auth/resetpassword', '/auth/email-verified-success', '/auth/otp-verify'];

    const shouldHideLayout = hideLayoutRoutes.includes(router.pathname);

    return (
        <Provider store={store}>
            {/* PersistGate, state bərpa olunana qədər UI-ın render olunmasının qarşısını alır */}
            <PersistGate loading={null} persistor={persistor}>
                {/* ✨ ToastProvider'ı buraya əlavə edin */}
                <ToastProvider> 
                    {!shouldHideLayout && <Navbar />}
                    <main className="min-h-screen">
                        <Component {...pageProps} />
                    </main>
                    {!shouldHideLayout && <Footer />}
                </ToastProvider> {/* ✨ Bağlayıcı taqı */}
            </PersistGate>
        </Provider>
    );
}