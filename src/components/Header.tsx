import React from 'react';
import { useStore } from '../context/StoreContext';
import { IMAGES } from '../data/images';

export const Header: React.FC<{ title?: string; showBack?: boolean; onBack?: () => void }> = ({
  title,
  showBack = false,
  onBack,
}) => {
  const {
    bagCount,
    navigateTo,
    activeRoute,
    unrecordedDraft,
    publishChanges,
    openWhatsApp,
    config,
  } = useStore();

  const logoSrc = config.logo ? (IMAGES[config.logo] || config.logo) : IMAGES.logo;

  if (showBack) {
    return (
      <header className="sticky top-0 z-30 bg-[#fcf9f4]/95 backdrop-blur-md border-b border-[#eee7dc] px-3 sm:px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigateTo('catalog');
              }
            }}
            className="w-8 h-8 rounded-full border border-[#ded5c7] bg-white flex items-center justify-center text-[#2b352a] hover:bg-[#f5efe6] transition-colors cursor-pointer shadow-xs"
            aria-label="Back"
          >
            <span className="material-icon text-base">arrow_back</span>
          </button>

          <h2 className="font-luxury-brand text-base sm:text-lg font-bold text-[#2b352a] truncate px-2 flex items-center gap-2">
            <img src={logoSrc} alt="" className="w-5 h-5 object-contain" />
            {title || 'Shae.made'}
          </h2>

          <button
            onClick={() => navigateTo('bag')}
            className="relative w-8 h-8 rounded-full border border-[#ded5c7] bg-white flex items-center justify-center text-[#2b352a] hover:bg-[#f5efe6] transition-colors cursor-pointer shadow-xs"
            aria-label="Shopping bag"
          >
            <span className="material-icon text-base">shopping_bag</span>
            {bagCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-[#59684c] text-white text-[9.5px] font-bold rounded-full flex items-center justify-center px-0.5">
                {bagCount}
              </span>
            )}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-[#fcf9f4]/95 backdrop-blur-md border-b border-[#eee7dc] px-3 sm:px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Area: Ribbon 'S' logo + Shae.made in luxury serif */}
        <button
          onClick={() => navigateTo('')}
          className="flex items-center gap-2 text-xl sm:text-2xl font-luxury-brand font-bold text-[#2b352a] tracking-tight whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <img
            src={logoSrc}
            alt="Shae.made Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs"
          />
          <span>Shae.made</span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#737c6e]">
          {[
            { route: '', label: 'Home' },
            { route: 'catalog', label: 'Catalog' },
            { route: 'custom', label: 'Custom Order' },
            { route: 'bag', label: 'Shopping Bag' },
            { route: 'admin', label: 'Admin Portal' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigateTo(item.route)}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeRoute === item.route
                  ? 'bg-[#e8eee3] text-[#34402c] font-bold'
                  : 'hover:text-[#2b352a] hover:bg-white/80'
              }`}
            >
              {item.label}
              {item.route === 'bag' && bagCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.2 bg-[#59684c] text-white text-[9.5px] font-bold rounded-full">
                  {bagCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Action Icons: Admin, Search, WhatsApp Chat, Cart */}
        <div className="flex items-center gap-1.5 shrink-0">
          {unrecordedDraft && (
            <button
              onClick={() => publishChanges()}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-[#e8eee3] hover:bg-[#dbe4d5] text-[#34402c] px-2.5 py-1 rounded-full border border-[#59684c]/20 transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="material-icon text-xs">upload</span>
              <span>Publish</span>
            </button>
          )}

          {/* Admin Panel Icon button */}
          <button
            onClick={() => navigateTo('admin')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              activeRoute === 'admin'
                ? 'bg-[#59684c] text-white'
                : 'text-[#2b352a] hover:bg-white'
            }`}
            aria-label="Admin Portal"
            title="Open Admin Portal"
          >
            <span className="material-icon text-lg">admin_panel_settings</span>
          </button>

          {/* Search Icon button */}
          <button
            onClick={() => navigateTo('catalog')}
            className="w-8 h-8 rounded-full text-[#2b352a] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Search Catalog"
            title="Search crafts"
          >
            <span className="material-icon text-lg">search</span>
          </button>

          {/* WhatsApp Speech Bubble Chat Icon */}
          <button
            onClick={() =>
              openWhatsApp('Hello Shae.made! 🌿 I would love to know more about your handcrafted gifts.')
            }
            className="w-8 h-8 rounded-full text-[#2b352a] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <span className="material-icon text-lg">chat_bubble_outline</span>
          </button>

          {/* Bag Button */}
          <button
            onClick={() => navigateTo('bag')}
            className="relative w-8 h-8 rounded-full text-[#2b352a] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Bag"
            title="Shopping bag"
          >
            <span className="material-icon text-lg">shopping_bag</span>
            {bagCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[15px] h-[15px] bg-[#59684c] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {bagCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
