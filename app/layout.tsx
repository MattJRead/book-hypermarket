import './globals.css';

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}