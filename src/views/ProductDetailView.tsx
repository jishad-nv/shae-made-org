import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

export const ProductDetailView: React.FC<{ productId: string }> = ({ productId }) => {
  const {
    getProductById,
    getProductGallery,
    addToBag,
    openOrderModal,
    navigateTo,
  } = useStore();

  const product = getProductById(productId);

  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('Pastel Pink');
  const [selectedLed, setSelectedLed] = useState<string>('Warm White');
  const [customMsg, setCustomMsg] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fcf9f4]">
        <Header showBack title="Craft Not Found" />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <h2 className="font-luxury-serif text-lg font-bold text-[#2b352a] mb-2">
            Craft not found
          </h2>
          <p className="text-xs text-[#737c6e] mb-4">
            This item may have been moved or is currently unavailable.
          </p>
          <button onClick={() => navigateTo('catalog')} className="btn-primary text-xs">
            Back to Catalog
          </button>
        </main>
      </div>
    );
  }

  const gallery = getProductGallery(product);
  const discountPercent =
    product.mrp > product.price
      ? Math.round((1 - product.price / product.mrp) * 100)
      : 0;

  const handleOrderNow = () => {
    openOrderModal(product, quantity, {
      color: selectedColor,
      led: selectedLed,
      msg: customMsg,
    });
  };

  const handleAddToBag = () => {
    addToBag(
      product.id,
      {
        color: selectedColor,
        led: selectedLed,
        msg: customMsg,
      },
      quantity
    );
  };

  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Header showBack title={product.name} />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 sm:gap-8 items-start">
          {/* Left Column: Image Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#eee7dc] bg-white shadow-xs">
              <img
                src={gallery[activePhotoIndex] || gallery[0]}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />

              {product.badge && (
                <span className="badge-tag-peach absolute top-2.5 left-2.5 z-10 shadow-xs">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIndex(i)}
                    className={`relative w-13 h-13 rounded-xl border overflow-hidden transition-all shrink-0 cursor-pointer ${
                      activePhotoIndex === i
                        ? 'border-[#59684c] ring-2 ring-[#59684c]/30'
                        : 'border-[#eee7dc] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Order Module */}
          <div className="space-y-3">
            <div className="bg-white border border-[#eee7dc] rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
              <span className="text-[10.5px] font-bold text-[#59684c] uppercase tracking-wider flex items-center gap-1">
                <span className="material-icon fill text-xs">eco</span>
                Handcrafted by Shae.made
              </span>

              <h1 className="font-luxury-serif font-bold text-lg sm:text-2xl text-[#2b352a] leading-snug">
                {product.name}
              </h1>

              <p className="text-xs text-[#737c6e] font-medium">
                {product.sub}
              </p>

              {product.desc && (
                <p className="text-xs text-[#2b352a]/85 leading-relaxed pt-2 border-t border-[#f5efe6]">
                  {product.desc}
                </p>
              )}

              {/* Price Row */}
              <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                <b className="text-xl sm:text-2xl font-bold text-[#2b352a] tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </b>
                {product.mrp > product.price && (
                  <s className="text-xs text-[#737c6e] tabular-nums">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </s>
                )}
                {discountPercent > 0 && (
                  <span className="badge-tag-peach text-[10px]">
                    {discountPercent}% off
                  </span>
                )}
              </div>
            </div>

            {/* Customization Callout */}
            <div className="bg-[#f5efe6] border border-[#eee7dc] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#2b352a]">
              <span className="material-icon text-base text-[#59684c] shrink-0 mt-0.5">
                add_a_photo
              </span>
              <div>
                <b className="block font-bold">Photo & Message Customization</b>
                <p className="text-[#737c6e] text-[11px]">
                  Send your high-res photos and names via WhatsApp directly after clicking order.
                </p>
              </div>
            </div>

            {/* Product Options Card */}
            <div className="bg-white border border-[#eee7dc] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              {/* Resin Color */}
              {['Resin Crafts', 'Resin', 'Frames', 'Custom Frames'].includes(product.cat) && (
                <div>
                  <b className="text-xs font-bold text-[#2b352a] block mb-1">
                    Resin Color
                  </b>
                  <div className="flex flex-wrap gap-1.5">
                    {['Pastel Pink', 'Lavender', 'Baby Blue', 'Gold Flakes'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          selectedColor === col
                            ? 'bg-[#59684c] text-white shadow-xs'
                            : 'bg-[#fcf9f4] border border-[#eee7dc] text-[#2b352a]'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fairy Lights */}
              {['Frames', 'Custom Frames'].includes(product.cat) && (
                <div>
                  <b className="text-xs font-bold text-[#2b352a] block mb-1">
                    Fairy Lights
                  </b>
                  <div className="flex flex-wrap gap-1.5">
                    {['Warm White', 'Rainbow Glow', 'No Lights'].map((led) => (
                      <button
                        key={led}
                        onClick={() => setSelectedLed(led)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          selectedLed === led
                            ? 'bg-[#59684c] text-white shadow-xs'
                            : 'bg-[#fcf9f4] border border-[#eee7dc] text-[#2b352a]'
                        }`}
                      >
                        {led}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Message / Name */}
              <div>
                <label className="text-xs font-bold text-[#2b352a] block mb-1">
                  Custom Name or Inscription <span className="font-normal text-[#737c6e]">(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="e.g. Rahul & Anjali · 14.02.2026"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-2 border-t border-[#f5efe6]">
                <b className="text-xs font-bold text-[#2b352a]">Quantity</b>
                <div className="inline-flex items-center gap-2 border border-[#eee7dc] rounded-full p-0.5 bg-[#fcf9f4]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-[#2b352a] hover:bg-[#eee7dc] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <span className="material-icon text-xs">remove</span>
                  </button>
                  <span className="text-xs font-bold px-2 tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-[#2b352a] hover:bg-[#eee7dc] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <span className="material-icon text-xs">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-[11px] text-[#737c6e] text-center leading-relaxed">
              No online card needed. Chat directly on WhatsApp to confirm photos, delivery address and pay via UPI before dispatch.
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed left-0 right-0 bottom-0 z-30 bg-[#fcf9f4]/95 backdrop-blur-md border-t border-[#eee7dc] py-2 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button
            onClick={handleOrderNow}
            disabled={!product.stock}
            className={`btn-order flex-1 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 ${
              !product.stock ? 'opacity-60 cursor-not-allowed bg-stone-400 !important' : ''
            }`}
          >
            <span className="material-icon fill text-base">chat</span>
            <span>Order on WhatsApp (₹{(product.price * quantity).toLocaleString('en-IN')})</span>
          </button>

          <button
            onClick={handleAddToBag}
            className="btn-secondary py-2 px-3.5 text-xs font-bold shrink-0"
          >
            <span className="material-icon text-base">shopping_bag</span>
            <span className="hidden sm:inline">Add to Bag</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
