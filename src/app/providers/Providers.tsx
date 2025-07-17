// path/to/Providers.tsx (Misal üçün, app/providers.tsx ola bilər)
'use client' // Bu vacibdir

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store/store';
import { ToastProvider } from 'arzu-toast-modal';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <Provider store={store}>{children}</Provider>
    </ToastProvider>
  );
}