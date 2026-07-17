import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
