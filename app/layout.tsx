import './globals.css'; 
import { Providers } from './providers';

export const metadata = {
  title: 'Book Hypermarket',
  description: 'Your ultimate reading network and storefront.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}