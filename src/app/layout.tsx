import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MIRALOU | High-End Streetwear Footwear Bangladesh',
  description: 'Exclusive streetwear sneakers and avant-garde footwear with dark brutalist aesthetics. Fast delivery across Bangladesh with SSLCommerz.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Inline script: apply saved theme class BEFORE paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('miralou_theme') || 'dark';
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(t);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#E50914] selection:text-white bg-[#f8f9fa] text-neutral-900 dark:bg-[#121212] dark:text-[#f4f4f5] transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <Navbar />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
