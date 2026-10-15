import React from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { ProductCard } from '../components/ProductCard';
import { Hero3DCarousel } from '../components/Hero3DCarousel';
import { IMAGES } from '../data/images';

export const HomeView: React.FC = () => {
  const {
    products,
    categories,
    heroSettings,
    reviews,
    stories,
    config,
    founderSettings,
    getProductCover,
    navigateTo,
    openLightbox,
    openWhatsApp,
  } = useStore();

  const trendingProducts = heroSettings.slots
    .map((slotId) => products.find((p) => p.id === slotId))
    .filter((p): p is Product => p !== undefined);

  const featuredProduct = trendingProducts[0] || products[0];

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.r, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div className="min-h-screen bg-[#fcf9f4]">
      <Header />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-1.5 sm:pt-2.5 pb-3 sm:pb-5">
        {/* Subtle Announcement Ticker */}
        <div className="mb-2.5 overflow-hidden bg-[#f5efe6] border border-[#eee7dc] rounded-full text-[#34402c] font-semibold text-[11px] sm:text-xs py-1 px-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="material-icon fill text-xs text-[#59684c]">eco</span>
            <span>{heroSettings.tick}</span>
          </div>
        </div>

        {/* Interactive 3D Model Hero Section */}
        <section className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#eee7dc] bg-gradient-to-br from-[#ffffff] via-[#fcf9f4] to-[#f5efe6] p-4 sm:p-7 mb-4 shadow-xs">
          <div className="flex flex-col items-center text-center space-y-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#59684c] bg-[#e8eee3] px-2.5 py-0.5 rounded-full">
              <span className="material-icon fill text-xs">local_florist</span>
              Handmade in Kerala · All-India Delivery
            </span>

            <h1 className="font-luxury-serif font-bold text-xl sm:text-3xl text-[#2b352a] leading-[1.15] max-w-lg">
              {heroSettings.title}
            </h1>
          </div>

          {/* 3D Animated Interactive Product Carousel Model */}
          <Hero3DCarousel
            products={trendingProducts}
            getProductCover={getProductCover}
            onSelectProduct={(id) => navigateTo(`p/${id}`)}
          />

          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap mt-4">
            <button
              onClick={() => navigateTo('catalog')}
              className="btn-primary text-xs py-1.5 px-3.5 shadow-xs"
            >
              Shop Crafts
            </button>
            <button
              onClick={() => navigateTo('custom')}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Custom Order
            </button>
          </div>
        </section>

        {/* 4 Clean Category Circles (Pinterest/Korean Style) */}
        <section className="mb-4 sm:mb-5">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-center">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigateTo('catalog')}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-white border border-[#eee7dc] flex items-center justify-center text-[#2b352a] group-hover:border-[#59684c] group-hover:bg-[#f5efe6] transition-all shadow-xs">
                  <span className="material-icon text-lg sm:text-2xl text-[#2b352a]">
                    {cat.icon}
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#2b352a] leading-tight line-clamp-1">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending Picks Section: Compact 2-Column Responsive Grid */}
        <section className="mb-5 sm:mb-6">
          <div className="flex items-baseline justify-between mb-2 px-0.5">
            <h2 className="font-luxury-serif text-lg sm:text-xl font-bold text-[#2b352a]">
              Trending Picks
            </h2>
            <span className="text-[11px] sm:text-xs text-[#737c6e] font-semibold">
              {trendingProducts.length} Items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-4 items-stretch">
            {trendingProducts.map((p, idx) => (
              <ProductCard key={p!.id} product={p!} index={idx} />
            ))}
          </div>
        </section>

        {/* How to Order Card */}
        <section className="mb-5 sm:mb-6">
          <div className="bg-white border border-[#eee7dc] rounded-[20px] p-4 sm:p-6 shadow-xs space-y-3">
            <h2 className="font-luxury-serif text-lg sm:text-xl font-bold text-[#2b352a]">
              How to Order?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#fcf9f4] border border-[#eee7dc]">
                <span className="w-6 h-6 rounded-full bg-[#e8eee3] text-[#34402c] font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-xs font-bold text-[#2b352a]">
                  Pick Your Craft
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#fcf9f4] border border-[#eee7dc]">
                <span className="w-6 h-6 rounded-full bg-[#e8eee3] text-[#34402c] font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-xs font-bold text-[#2b352a]">
                  Click Add / Order
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#fcf9f4] border border-[#eee7dc]">
                <span className="w-6 h-6 rounded-full bg-[#e8eee3] text-[#34402c] font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="text-xs font-bold text-[#2b352a]">
                  Send Custom Text
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                openWhatsApp(
                  'Hello Shae.made! 🌿 I would love to place a custom handcrafted order.'
                )
              }
              className="btn-order w-full py-2.5 text-xs sm:text-sm font-bold rounded-xl mt-1 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span className="material-icon fill text-base">chat</span>
              <span>Chat on WhatsApp for Custom Orders</span>
            </button>
          </div>
        </section>

        {/* Integrated Instagram Profile & Live Craft Showcase */}
        <section className="mb-5 sm:mb-6">
          <div className="bg-white border border-[#eee7dc] rounded-[20px] p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                {/* Instagram Story Gradient Ring */}
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-0.5">
                    <img
                      src={IMAGES.logo}
                      alt="Shae.made Instagram"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <b className="font-luxury-serif text-sm sm:text-base text-[#2b352a]">
                      @{config.igh}
                    </b>
                    <span className="material-icon fill text-sm text-[#59684c]">verified</span>
                  </div>
                  <p className="text-[11px] text-[#737c6e] font-medium">
                    184 posts · 4.8k followers · 4.9★ community love
                  </p>
                </div>
              </div>

              <a
                href={`https://www.instagram.com/${config.igh}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <span className="material-icon text-xs">open_in_new</span>
                <span>Follow on Instagram</span>
              </a>
            </div>

            <p className="text-xs text-[#2b352a]/90 leading-relaxed font-medium bg-[#fcf9f4] p-2.5 rounded-xl border border-[#eee7dc]">
              Bespoke resin keepsakes, eternal crochet blooms & personalized photo gifts from Kerala 🌿 Shipping Pan-India with careful kraft packaging & wax seals.
            </p>

            {/* Aesthetic Instagram Visual Post Tiles */}
            {stories.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-luxury-serif text-sm sm:text-base font-bold text-[#2b352a] flex items-center gap-1.5">
                  <span className="material-icon text-sm text-[#59684c]">auto_awesome</span>
                  Stories of Work
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {stories.map((story, k) => (
                    <button
                      key={k}
                      onClick={() => openLightbox(k)}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#eee7dc] bg-[#f5efe6] group cursor-pointer"
                    >
                      <img
                        src={IMAGES[story.img] || story.img}
                        alt={story.cap || 'Shae.made post'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                        <span className="material-icon text-xs">favorite</span>
                        <span>340</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Personal Profile Section: Meet the Founder & Artisan */}
        {founderSettings.showSection !== false && (
          <section className="mb-5 sm:mb-6">
            <div className="bg-[#f5efe6] border border-[#eee7dc] rounded-[20px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                  <img
                    src={IMAGES[founderSettings.img] || founderSettings.img || IMAGES.artisan}
                    alt={`${founderSettings.name} · ${founderSettings.role}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#59684c] border-2 border-white flex items-center justify-center text-[9px] text-white">
                  {founderSettings.badgeIcon || '🌿'}
                </span>
              </div>

              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold text-[#59684c] uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full inline-block">
                  {founderSettings.badge || 'Meet the Maker & Studio'}
                </span>
                <h3 className="font-luxury-serif text-base sm:text-lg font-bold text-[#2b352a]">
                  {founderSettings.name}{founderSettings.role ? ` · ${founderSettings.role}` : ''}
                </h3>
                <p className="text-xs text-[#737c6e] leading-relaxed">
                  “{founderSettings.bio.replace(/^[“"']+|[”"']+$/g, '')}”
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() =>
                      openWhatsApp(
                        founderSettings.chatPrompt ||
                          `Hi ${founderSettings.name}! 🌿 I would love to discuss a custom handcrafted gift design.`
                      )
                    }
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <span className="material-icon text-xs">chat</span>
                    <span>{founderSettings.chatBtnText || `Chat with ${founderSettings.name}`}</span>
                  </button>
                  <button
                    onClick={() => navigateTo(founderSettings.secondaryBtnAction || 'custom')}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <span>{founderSettings.secondaryBtnText || 'Request Bespoke Idea'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-2.5 px-0.5">
            <h2 className="font-luxury-serif text-lg sm:text-xl font-bold text-[#2b352a]">
              Words of Love
            </h2>
            <span className="text-xs text-[#59684c] font-bold">
              ★ {averageRating} rating
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#eee7dc] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#d97a53] mb-1.5">
                    {Array.from({ length: rev.r }).map((_, i) => (
                      <span key={i} className="material-icon fill text-xs">
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#2b352a] italic leading-relaxed">
                    &ldquo;{rev.t}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f5efe6] text-[11px] text-[#737c6e]">
                  <b className="font-semibold text-[#2b352a]">{rev.n}</b>
                  <span>{rev.pl}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};
