import React from 'react';
import Navbar from './components/Navbar';
import SidebarLeft from './components/SidebarLeft';
import Feed from './components/Feed';
import SidebarRight from './components/SidebarRight';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-20 grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 sm:p-6">
        <SidebarLeft />
        <Feed />
        <SidebarRight />
      </main>
    </div>
  );
}