import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { IMAGES } from '../data/images';

export const FloatingWhatsApp: React.FC = () => {
  const { config, openWhatsApp, founderSettings, activeRoute } = useStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  // Quick inquiry preset prompts
  const quickPrompts = [
    { label: '🌸 Custom Resin Inquiry', text: 'Hello Shae.made! 🌿 I would like to inquire about a custom resin floral craft.' },
    { label: '🎁 Gift Recommendation', text: 'Hi Shana! Can you recommend a special gift for an upcoming occasion?' },
    { label: '📦 Delivery & Timeline', text: 'Hello! I wanted to check the delivery timeline and order options for my location.' },
  ];

  const handleStartChat = (messageText?: string) => {
    const textToSend = messageText || 'Hello Shae.made! 🌿 I am browsing your handcrafted collection and would love to chat.';
    openWhatsApp(textToSend);
    setIsOpen(false);
  };

  const logoSrc = config.logo ? (IMAGES[config.logo] || config.logo) : IMAGES.logo;
  const founderImgSrc = founderSettings?.img ? (IMAGES[founderSettings.img] || founderSettings.img) : IMAGES.artisan;

  return (
    <aside
      aria-label="Direct WhatsApp Support"
      className="fixed right-3.5 sm:right-6 bottom-20 md:bottom-6 z-40 flex flex-col items-end pointer-events-none"
    >
      {/* Floating Popup Card */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[calc(100vw-32px)] sm:w-84 max-w-sm bg-white rounded-2xl border border-[#ded5c7] shadow-[0_12px_36px_rgba(43,53,42,0.18)] overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header in Olive Brand Color (Same olive color as regular order button) */}
          <div className="bg-[#59684c] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/60 bg-white shrink-0">
                <img
                  src={founderImgSrc || logoSrc}
                  alt="Shae.made Artisan"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-luxury-serif font-bold text-sm tracking-tight leading-tight flex items-center gap-1.5">
                  Shae.made Studio
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-sans font-medium">Direct</span>
                </h4>
                <p className="text-[11px] text-[#e8eee3] flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                  Replies typically within minutes
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close WhatsApp chat popup"
            >
              <span className="material-icon text-sm">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 bg-[#fcf9f4] space-y-3">
            {/* Friendly Greeting Bubble */}
            <div className="bg-white rounded-xl rounded-tl-xs p-3 border border-[#eee7dc] shadow-xs text-xs text-[#2b352a] space-y-1">
              <p className="font-semibold text-[#59684c] flex items-center gap-1">
                <span>👋 Welcome to Shae.made!</span>
              </p>
              <p className="text-[#59684c]/90 text-[11.5px] leading-relaxed">
                Handcrafted resin & botanicals from Kerala. How can we help you create or customize your keepsake today?
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737c6e] block mb-1.5">
                Quick Inquiries
              </span>
              <div className="space-y-1.5">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStartChat(item.text)}
                    className="w-full text-left text-[11.5px] bg-white hover:bg-[#e8eee3] text-[#2b352a] hover:text-[#34402c] p-2 rounded-xl border border-[#eee7dc] hover:border-[#59684c]/40 transition-colors flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <span className="truncate pr-1">{item.label}</span>
                    <span className="material-icon text-xs text-[#737c6e] group-hover:text-[#59684c] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>



            {/* Direct Send Button in Olive Color (matches regular order button) */}
            <button
              type="button"
              onClick={() => handleStartChat()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#59684c] hover:bg-[#47543c] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_3px_10px_rgba(89,104,76,0.3)] hover:shadow-[0_4px_14px_rgba(89,104,76,0.4)] active:scale-98 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.488-8.416" />
              </svg>
              <span>Chat on WhatsApp Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Area */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* Floating Popup Speech Pill */}
        {!isOpen && showTooltip && (
          <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-[#2b352a] px-3 py-1.5 rounded-full border border-[#ded5c7] shadow-[0_4px_14px_rgba(43,53,42,0.1)] text-xs font-semibold animate-in fade-in slide-in-from-right-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="hover:text-[#59684c] transition-colors cursor-pointer whitespace-nowrap"
            >
              Direct WhatsApp Chat
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-[#737c6e] hover:text-[#2b352a] ml-1 p-0.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              title="Dismiss label"
              aria-label="Dismiss label"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Floating WhatsApp Chat Icon Button in Olive Color */}
        <div className="relative group">
          {/* Subtle Olive Pulse Glow */}
          <span className="absolute -inset-1 rounded-full bg-[#59684c]/25 blur-sm animate-pulse -z-10"></span>

          <button
            type="button"
            onClick={() => {
              // Toggles popup; if popup is closed and user double clicks or wants quick action, clicking opens popup with option to chat directly
              setIsOpen((prev) => !prev);
            }}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#59684c] hover:bg-[#47543c] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(89,104,76,0.38)] hover:shadow-[0_8px_24px_rgba(89,104,76,0.48)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/70"
            aria-label="Direct WhatsApp Chat"
            title="Direct WhatsApp Chat"
          >
            {isOpen ? (
              <span className="material-icon text-2xl">close</span>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 fill-current"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.488-8.416" />
              </svg>
            )}

            {/* Online Green Indicator Dot */}
            {!isOpen && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs"></span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
