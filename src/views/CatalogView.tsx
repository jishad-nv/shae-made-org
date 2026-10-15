import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { ProductCard } from '../components/ProductCard';

export const CatalogView: React.FC = () => {
  const { products, categories, navigateTo } = useStore();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter products by visibility, category, and query
  const filteredProducts = products.filter((p) => {
    if (!p.vis) return false;
    const matchesCat = selectedCat === 'All' || p.cat === selectedCat;
    const matchesQuery =
      searchQuery.trim() === '' ||
      (p.name + p.sub + p.cat + (p.desc || ''))
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Header />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-2 pb-12">
        {/* Title and Count */}
        <div className="flex items-baseline justify-between mb-2 px-0.5">
          <h1 className="font-luxury-serif text-lg sm:text-2xl font-bold text-[#2b352a]">
            Handcrafted Catalog
          </h1>
          <span className="text-[11px] sm:text-xs text-[#737c6e] font-semibold">
            {filteredProducts.length} items
          </span>
        </div>

        {/* Live Search Input */}
        <div className="relative mb-2.5">
          <span className="absolute left-3 top-2 text-[#737c6e] material-icon text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search polaroid frames, coasters, bouquets..."
            className="w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-xl border border-[#eee7dc] bg-white text-xs sm:text-sm text-[#2b352a] font-medium focus:outline-none focus:border-[#59684c] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[#737c6e] hover:text-[#2b352a] cursor-pointer"
              aria-label="Clear search"
            >
              <span className="material-icon text-xs sm:text-sm">close</span>
            </button>
          )}
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-3 scrollbar-none">
          {['All', ...categories.map((c) => c.name)].map((catName) => {
            const isSelected = selectedCat === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCat(catName)}
                className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#59684c] text-white shadow-xs font-bold'
                    : 'bg-white border border-[#eee7dc] text-[#2b352a] hover:border-[#59684c]'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Products Grid: Strict 2-Column Mobile with balanced aspect ratios */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 items-stretch">
            {filteredProducts.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#eee7dc] rounded-2xl p-8 text-center my-6 shadow-xs">
            <span className="material-icon text-3xl text-[#737c6e]/50 mb-2">
              search_off
            </span>
            <h3 className="font-luxury-serif text-base text-[#2b352a] mb-1">
              No crafts found
            </h3>
            <p className="text-xs text-[#737c6e] max-w-xs mx-auto mb-3">
              We couldn’t find any craft matching your query. Would you like to request a custom design?
            </p>
            <button
              onClick={() => {
                setSelectedCat('All');
                setSearchQuery('');
              }}
              className="btn-secondary text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Custom Order Callout */}
        <div className="bg-white border border-[#eee7dc] rounded-2xl p-3.5 sm:p-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-xs">
          <div>
            <h3 className="font-luxury-serif text-sm sm:text-base font-bold text-[#2b352a]">
              Want a custom size, flower type or text?
            </h3>
            <p className="text-[11px] sm:text-xs text-[#737c6e]">
              Send your reference photo and Shana will craft it for you.
            </p>
          </div>

          <button
            onClick={() => navigateTo('custom')}
            className="btn-primary text-xs py-1.5 px-3.5 shrink-0"
          >
            <span className="material-icon text-xs sm:text-sm">auto_awesome</span>
            <span>Custom Order</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
