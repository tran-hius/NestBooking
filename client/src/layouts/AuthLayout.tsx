import { MapPin, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full bg-slate-900 h-16 flex items-center">
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              NestBooking
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="text-white hover:bg-white/10 p-2 rounded-full transition">
              <span className="font-bold">VN</span>
            </button>
            <button className="text-white hover:bg-white/10 p-2 rounded-full transition">
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
