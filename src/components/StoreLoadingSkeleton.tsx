import React from 'react';

export const StoreLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fcf9f4] p-4 sm:p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between pb-3 border-b border-[#eee7dc]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#eee7dc]" />
          <div className="space-y-1">
            <div className="w-24 h-4 rounded bg-[#eee7dc]" />
            <div className="w-16 h-2.5 rounded bg-[#eee7dc]" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-[#eee7dc]" />
          <div className="w-8 h-8 rounded-full bg-[#eee7dc]" />
        </div>
      </div>

      {/* Hero Section Placeholder */}
      <div className="w-full h-[55vh] max-h-[460px] rounded-[24px] bg-[#f5efe6] border border-[#eee7dc] p-6 flex flex-col items-center justify-center space-y-3">
        <div className="w-48 h-6 rounded-full bg-[#e8eee3]" />
        <div className="w-64 h-10 rounded-xl bg-[#eee7dc]" />
        <div className="w-80 max-w-xs h-4 rounded bg-[#eee7dc]" />
        <div className="flex gap-3 pt-3">
          <div className="w-28 h-8 rounded-xl bg-[#59684c]/30" />
          <div className="w-28 h-8 rounded-xl bg-[#eee7dc]" />
        </div>
      </div>

      {/* Category Circles Placeholder */}
      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-full bg-[#eee7dc]" />
            <div className="w-12 h-2.5 rounded bg-[#eee7dc]" />
          </div>
        ))}
      </div>

      {/* Product Grid Placeholder */}
      <div className="space-y-3 pt-2">
        <div className="w-36 h-5 rounded bg-[#eee7dc]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3 rounded-2xl bg-white border border-[#eee7dc] space-y-2">
              <div className="w-full aspect-square rounded-xl bg-[#f5efe6]" />
              <div className="w-3/4 h-3.5 rounded bg-[#eee7dc]" />
              <div className="w-1/2 h-3 rounded bg-[#eee7dc]" />
              <div className="flex justify-between items-center pt-1">
                <div className="w-12 h-3.5 rounded bg-[#e8eee3]" />
                <div className="w-6 h-6 rounded-lg bg-[#eee7dc]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
