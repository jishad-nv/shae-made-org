import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    getProductCover,
    navigateTo,
    addToBag,
    toggleFavorite,
    isFavorite,
    openOrderModal,
  } = useStore();

  const favorite = isFavorite(product.id);

  const handleOrderDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.stock) return;
    openOrderModal(product, 1);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToBag(product.id, undefined, 1);
  };

  return (
    <article
      onClick={() => navigateTo(`p/${product.id}`)}
      className="bg-white border border-[#eee7dc] rounded-[18px] p-2 sm:p-2.5 flex flex-col justify-between shadow-[0_2px_8px_rgba(43,53,42,0.03)] hover:shadow-[0_4px_16px_rgba(43,53,42,0.07)] hover:border-[#ded5c7] transition-all cursor-pointer group h-full"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full rounded-[14px] overflow-hidden bg-[#f5efe6] shrink-0">
        <img
          src={getProductCover(product)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Korean Soft Peach Badge Tag */}
        {product.badge && (
          <span className="badge-tag-peach absolute top-1.5 left-1.5 z-10 shadow-xs">
            {product.badge}
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-1.5 right-1.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-all active:scale-80 cursor-pointer shadow-xs ${
            favorite ? 'text-[#d97a53]' : 'text-[#737c6e] hover:text-[#d97a53]'
          }`}
          aria-label={favorite ? 'Remove favorite' : 'Save favorite'}
        >
          <span className={`material-icon text-xs sm:text-sm ${favorite ? 'fill' : ''}`}>
            favorite
          </span>
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 justify-between pt-1.5">
        <div>
          <h3 className="font-luxury-serif font-bold text-[12px] sm:text-[13.5px] text-[#2b352a] leading-tight line-clamp-1 truncate group-hover:text-[#59684c] transition-colors">
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-[11px] text-[#737c6e] truncate mt-0.5">
            {product.sub}
          </p>

          <div className="flex items-baseline gap-1 mt-1">
            <b className="text-[12px] sm:text-sm font-bold text-[#2b352a] tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </b>
            {product.mrp > product.price && (
              <s className="text-[10px] sm:text-xs text-[#737c6e] tabular-nums">
                ₹{product.mrp.toLocaleString('en-IN')}
              </s>
            )}
          </div>
        </div>

        {/* Action Button: Compact & Balanced for Mobile */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-2">
          <button
            onClick={handleOrderDirect}
            disabled={!product.stock}
            className={`btn-order flex-1 text-center text-[11px] sm:text-xs py-1.5 transition-all ${
              !product.stock
                ? 'opacity-60 cursor-not-allowed bg-stone-400 !important'
                : 'hover:opacity-95'
            }`}
          >
            {product.stock ? 'Order' : 'Sold Out'}
          </button>

          <button
            onClick={handleQuickAdd}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border border-[#eee7dc] bg-[#fcf9f4] hover:bg-[#f5efe6] text-[#2b352a] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            aria-label="Add to bag"
            title="Add to bag"
          >
            <span className="material-icon text-sm sm:text-base">add</span>
          </button>
        </div>
      </div>
    </article>
  );
};
