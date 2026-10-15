import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface Hero3DCarouselProps {
  products: Product[];
  getProductCover: (p: Product) => string;
  onSelectProduct: (productId: string) => void;
}

export const Hero3DCarousel: React.FC<Hero3DCarouselProps> = ({
  products,
  getProductCover,
  onSelectProduct,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const displayProducts = products.length > 0 ? products.slice(0, 5) : [];

  // Auto-rotation loop
  useEffect(() => {
    if (isPaused || displayProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, displayProducts.length]);

  if (displayProducts.length === 0) return null;

  return (
    <div
      className="relative w-full py-2 sm:py-4 flex flex-col items-center justify-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Stage Container */}
      <div
        className="relative w-full max-w-[320px] sm:max-w-[420px] h-[220px] sm:h-[260px] flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {displayProducts.map((product, idx) => {
            const total = displayProducts.length;
            let offset = (idx - currentIndex + total) % total;
            if (offset > total / 2) offset -= total; // -2, -1, 0, 1, 2

            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            // 3D transforms based on offset for model rotation loop
            const translateX = offset * 85;
            const translateZ = isCenter ? 70 : -absOffset * 90;
            const rotateY = offset * -20;
            const scale = isCenter ? 1.15 : Math.max(0.78, 1 - absOffset * 0.12);
            const opacity = Math.max(0.25, 1 - absOffset * 0.35);
            const zIndex = 10 - absOffset;

            return (
              <div
                key={product.id}
                onClick={() => {
                  if (isCenter) {
                    onSelectProduct(product.id);
                  } else {
                    setCurrentIndex(idx);
                  }
                }}
                className="absolute cursor-pointer transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group"
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                }}
              >
                <div
                  className={`w-[125px] sm:w-[155px] aspect-[4/5] rounded-[20px] bg-white p-2 transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none shadow-xl ${
                    isCenter
                      ? 'border-2 border-[#59684c] shadow-2xl ring-4 ring-[#e8eee3]/70'
                      : 'border border-[#eee7dc] shadow-md filter brightness-95'
                  }`}
                >
                  <div className="w-full h-[72%] rounded-[14px] overflow-hidden bg-[#f5efe6] relative">
                    <img
                      src={getProductCover(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {isCenter && (
                      <span className="absolute top-2 right-2 bg-[#59684c] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        3D Featured
                      </span>
                    )}
                  </div>
                  <div className="p-1.5 text-center flex flex-col justify-between h-[28%]">
                    <h3 className="font-luxury-serif text-[11px] sm:text-xs font-bold text-[#2b352a] line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#59684c] font-bold">₹{product.price}</span>
                      <span className="text-[9px] text-[#737c6e] group-hover:underline">Explore →</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls & Indicators */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length)
          }
          className="w-7 h-7 rounded-full bg-white border border-[#eee7dc] flex items-center justify-center text-[#2b352a] hover:bg-[#f5efe6] transition-colors shadow-xs cursor-pointer"
          aria-label="Previous"
        >
          <span className="material-icon text-sm">chevron_left</span>
        </button>

        <div className="flex items-center gap-1.5">
          {displayProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-[#59684c]' : 'w-1.5 bg-[#eee7dc]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % displayProducts.length)}
          className="w-7 h-7 rounded-full bg-white border border-[#eee7dc] flex items-center justify-center text-[#2b352a] hover:bg-[#f5efe6] transition-colors shadow-xs cursor-pointer"
          aria-label="Next"
        >
          <span className="material-icon text-sm">chevron_right</span>
        </button>
      </div>

      <div className="text-[10px] text-[#737c6e] mt-1.5 font-medium tracking-wide flex items-center gap-1">
      </div>
    </div>
  );
};
