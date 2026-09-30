import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Activity, LayoutDashboard, LineChart, Library, Search, ChevronDown } from 'lucide-react';
import { ActiveOperationSelector } from './ActiveOperationSelector';

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F4F4] text-slate-900 font-sans">
      
      {/* Top Govt Bar */}
      <div className="bg-[#1A202C] text-white text-[11px] py-1 px-4 md:px-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="hover:underline cursor-pointer">भारत सरकार | GOVERNMENT OF INDIA</span>
          <span className="hidden md:inline hover:underline cursor-pointer">पेट्रोलियम और प्राकृतिक गैस मंत्रालय | MINISTRY OF PETROLEUM AND NATURAL GAS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline cursor-pointer hover:underline">Skip to Main Content</span>
          <div className="flex items-center gap-1 font-bold">
            <span className="bg-white text-black px-1 cursor-pointer">A-</span>
            <span className="bg-white text-black px-1 cursor-pointer">A</span>
            <span className="bg-white text-black px-1 cursor-pointer">A+</span>
          </div>
          <span className="cursor-pointer hover:underline border-l border-slate-600 pl-4">English <ChevronDown className="inline w-3 h-3" /></span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Ashoka Emblem Placeholder */}
            <div className="flex flex-col items-center justify-center mr-4">
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-16" />
            </div>
            
            <div className="border-l-2 border-[#FF9933] pl-4">
              <h1 className="text-xl md:text-2xl font-bold text-[#000080] uppercase tracking-wide">
                Nearby Wells Intelligence System (NWIS)
              </h1>
              <h2 className="text-sm md:text-base font-semibold text-slate-600">
                Oil India Limited (OIL)
              </h2>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
             <ActiveOperationSelector />
             <img src="/oil_logo.svg" alt="OIL Logo" className="h-12 object-contain" />
          </div>
        </div>
        
        {/* Tricolor Ribbon */}
        <div className="h-1.5 w-full govt-header-gradient"></div>

        {/* Horizontal Navigation */}
        <nav className="bg-[#000080] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
            <NavLink 
              to="/" 
              className={({ isActive }) => `flex items-center py-3 px-5 transition-colors text-sm font-medium border-b-4 ${isActive ? 'bg-[#1a1a9a] border-[#FF9933]' : 'border-transparent hover:bg-[#1a1a9a]'}`}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({ isActive }) => `flex items-center py-3 px-5 transition-colors text-sm font-medium border-b-4 ${isActive ? 'bg-[#1a1a9a] border-[#FF9933]' : 'border-transparent hover:bg-[#1a1a9a]'}`}
            >
              <LineChart className="h-4 w-4 mr-2" />
              Well Analytics
            </NavLink>
            <NavLink 
              to="/knowledge" 
              className={({ isActive }) => `flex items-center py-3 px-5 transition-colors text-sm font-medium border-b-4 ${isActive ? 'bg-[#1a1a9a] border-[#FF9933]' : 'border-transparent hover:bg-[#1a1a9a]'}`}
            >
              <Library className="h-4 w-4 mr-2" />
              Institutional Memory
            </NavLink>
            
            <div className="ml-auto flex items-center px-4 bg-white/10">
               <Search className="w-4 h-4 mr-2 text-white/70" />
               <input type="text" placeholder="Search Portal..." className="bg-transparent border-none outline-none text-sm text-white placeholder-white/70 w-48" />
            </div>
          </div>
        </nav>
      </header>

      {/* Page Content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
         <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>
               <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">About NWIS</h3>
               <p className="mb-2">A decision-support initiative under the Ministry of Petroleum and Natural Gas.</p>
               <p>Designed to provide historical well intelligence and predictive analytics.</p>
            </div>
            <div>
               <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Quick Links</h3>
               <ul className="space-y-2">
                 <li><a href="#" className="hover:text-[#000080] hover:underline">Oil India Limited</a></li>
                 <li><a href="#" className="hover:text-[#000080] hover:underline">Ministry of Petroleum</a></li>
                 <li><a href="#" className="hover:text-[#000080] hover:underline">Directorate General of Hydrocarbons</a></li>
               </ul>
            </div>
            <div>
               <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Important Information</h3>
               <p className="mb-2">This site is for authorized personnel only.</p>
               <p>Data provided is indicative and should be corroborated with real-time logging.</p>
            </div>
         </div>
         <div className="bg-[#000080] text-white text-center py-4 text-xs">
            <p>Content Owned by Oil India Limited | Designed and Developed for Prototype Demonstration</p>
            <p className="mt-1 opacity-70">© 2026 Government of India. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
};
