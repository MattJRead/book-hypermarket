import Link from 'next/link';
import FloatingMenu from '../../components/FloatingMenu';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useTheme } from '@/components/ThemeProvider';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col py-12">      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Link href="/" className="absolute top-8 left-8 text-sky-400 hover:text-sky-300 font-bold tracking-wide flex items-center gap-2 z-10">
        <span>←</span> Return to Storefront
      </Link>

      <div className="max-w-3xl w-full mt-12 z-10">
        <h1 className="text-5xl font-extrabold mb-8 tracking-tight border-b border-gray-800 pb-8">
          What is book <span className="text-sky-400 italic">Hypermarket</span>
        </h1>
        
        <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
          <p>
            At <strong className="text-white">Book Hypermarket</strong>, our mission is simple: we help readers and collectors find the absolute best deals in seconds.
          </p>
          <p>
            We are a high-performance aggregation engine. We scour the web to spotlight the greatest live offers from industry giants like Waterstones, Blackwell's, Forbidden Planet and more. But we don't stop there.
          </p>
          <p>
            We believe a thriving ecosystem requires independent voices. That is why we are building a dedicated infrastructure to help small, independent bookstores and local comic shops plug their inventory directly into our network. We give small retailers the reach of a global storefront, allowing them to reach a wider audience.
          </p>
          <p>
            Whether you are hunting for a rare paperback, a graphic novel, or just the best price on a bestseller, Book Hypermarket brings the entire market to your fingertips.
          </p>
          <p>
            Book Hypermarket is currently in Beta. Our inventory and pricing engine are expanding daily. Thank you for your patience.
            </p>
          <p className="font-mono text-sky-400 text-sm pt-8 uppercase tracking-widest">
            
          </p>
        </div>
      </div>
      <FloatingMenu />
      <SpeedInsights />
    </main>
  );
}