import React from 'react';
import heroImage from './assets/images/grocery_food_hero_1786092590426.jpg';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 dir-rtl antialiased selection:bg-emerald-600 selection:text-white">
      <main className="max-w-6xl w-full mx-auto flex flex-col items-center text-center space-y-8 sm:space-y-12">
        {/* MAIN TITLE - GEOMETRIC KUFIC, DARK GREEN WITH SOFT SHADOW */}
        <div className="space-y-3 pt-4 sm:pt-6">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-kufi text-emerald-950 tracking-wide leading-tight drop-shadow-xs [text-shadow:_0_3px_15px_rgba(6,78,59,0.12)]">
            اشري من دارك
          </h1>
          <div className="w-24 sm:w-36 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 mx-auto rounded-full shadow-xs opacity-90" />
        </div>

        {/* HERO IMAGE CONTAINER */}
        <div className="w-full relative group transition-all duration-500">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-emerald-400/20 to-teal-600/20 rounded-[2rem] sm:rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-white p-2 sm:p-3 shadow-2xl shadow-emerald-950/10 border border-stone-200/80">
            <img
              src={heroImage}
              alt="اشري من دارك - تشكيلة واسعة من الفواكه، الخضروات، المأكولات، والمنتجات الغذائية الطازجة"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[70vh] object-cover rounded-xl sm:rounded-[1.5rem] transform transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
