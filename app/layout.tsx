import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gami Capital - Institutional DeFi Vaults',
  description:
    'Professional DeFi vault platform for institutional allocators. Discover flagship and advanced yield strategies managed by Gami Capital.',
  keywords: [
    'DeFi',
    'institutional',
    'yield vaults',
    'Gami Capital',
    'blockchain',
    'cryptocurrency',
    'yield',
    'Upshift',
    'August',
  ],
  authors: [{ name: 'Gami Capital Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Gami Capital - Institutional DeFi Vaults',
    description:
      'Professional DeFi vault platform for institutional allocators. Discover flagship and advanced yield strategies managed by Gami Capital.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gami Capital - Institutional DeFi Vaults',
    description:
      'Professional DeFi vault platform for institutional allocators. Discover flagship and advanced yield strategies managed by Gami Capital.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Providers>
          <Header />
          <main className='max-w-[1280px] mx-auto px-[84px] min-h-[calc(100vh-420px)]'>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
