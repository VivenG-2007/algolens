import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { AuthProvider } from '@/lib/context/AuthContext';

export const metadata: Metadata = {
  title: 'AlgoLens — See the Code. Understand the Algorithm.',
  description:
    'A real execution-driven educational DSA platform synchronizing dynamic user inputs with algorithm traces, code lines, variables, and Groq AI tutoring.',
  keywords: [
    'DSA',
    'Algorithm Visualizer',
    'Merge Sort',
    'Binary Search',
    'KMP',
    'AVL Tree',
    'Counting Sort',
    'Dynamic Input',
    'Computer Science',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-dark-bg text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
