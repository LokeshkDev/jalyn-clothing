import React from 'react';
import { ExternalLink, Database, ShieldCheck } from 'lucide-react';

export default function Header({ title, subtitle }) {
  return (
    <header className="bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Links & Status Badges */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live Website
        </a>

      </div>
    </header>
  );
}
