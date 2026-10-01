import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: 'RUN — MORE THAN CLOTHES. IT’S A MINDSET.',
  description: 'Oficiální e-shop prémiové oděvní značky RUN. Limitované kolekce, 550 GSM Heavy Teddy Fleece, boxy střihy, zakázkové detaily.',
  keywords: ['RUN', 'streetwear', 'clothing brand', 'teddy fur hoodie', 'baggy jeans', 'luxury apparel'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="dark">
      <body className="bg-[#080809] text-white min-h-screen flex flex-col selection:bg-white selection:text-black">
        <AuthProvider>
          <CurrencyProvider>
            <WishlistProvider>
              <CartProvider>
                <AnnouncementBar />
                <Header />
                <main className="flex-1">{children}</main>
                <CartDrawer />
                <Footer />
                <CookieBanner />
              </CartProvider>
            </WishlistProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
