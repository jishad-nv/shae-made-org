import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { compressImageToBase64, uploadImageToStorage } from '../utils/imageUpload';
import { STAGES, INITIAL_FOUNDER } from '../data/initialData';
import { IMAGES } from '../data/images';
import { Product, Inquiry, Review, Order, FounderSettings } from '../types';

export const AdminView: React.FC<{ activeTab?: string }> = ({ activeTab = 'ov' }) => {
  const {
    products,
    categories,
    heroSettings,
    reviews,
    stories,
    inquiries,
    orders,
    metrics,
    config,
    unrecordedDraft,
    publishChanges,
    navigateTo,
    showToast,
    isLoading,
    lastSyncTime,
    lastSyncError,
    isCloudConnected,
    uploadLocalDataToCloud,
    migrationStatus,
    logInquiry,
    addInstagramLead,
    updateInquiryStage,
    toggleInquiryPaid,
    updateInquiryMemo,
    deleteInquiry,
    createOrder,
    updateOrderStatus,
    toggleOrderPaid,
    updateOrderTracking,
    deleteOrder,
    updateProductInline,
    saveNewProduct,
    updateProductFull,
    deleteProduct,
    updateProductPhotoCover,
    removeProductPhoto,
    addProductPhoto,
    getProductCover,
    getProductGallery,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    updateHeroSettings,
    setTrendingSlot,
    addStoryPhoto,
    deleteStoryItem,
    addReview,
    deleteReview,
    founderSettings,
    updateFounderSettings,
    resetFounderToDefault,
    updateStoreSettings,
    updateStoreLogo,
    openWhatsApp,
  } = useStore();

  const currentTab = ['ov', 'orders', 'inq', 'prod', 'cat', 'show', 'founder', 'rev', 'set'].includes(
    activeTab
  )
    ? activeTab
    : 'ov';

  // Founder section states
  const [founderForm, setFounderForm] = useState<FounderSettings>(founderSettings);
  const [founderUrlInput, setFounderUrlInput] = useState<string>('');

  useEffect(() => {
    setFounderForm(founderSettings);
  }, [founderSettings]);

  // Orders pipeline states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  // Inquiry CRM states
  const [inquirySearch, setInquirySearch] = useState<string>('');
  const [inquiryFilterTab, setInquiryFilterTab] = useState<string>('All');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>('');
  const [showInstagramLeadModal, setShowInstagramLeadModal] = useState<boolean>(false);
  const [instagramLeadForm, setInstagramLeadForm] = useState({
    name: '',
    handle: '',
    phone: '',
    item: '',
    total: '',
    memo: '',
  });

  // Product manager states
  const [productCatFilter, setProductCatFilter] = useState<string>('All');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);

  useEffect(() => {
    const p = products.find((prod) => prod.id === editingProductId);
    setEditForm(p ? { ...p } : null);
  }, [editingProductId, products]);

  const [showNewProductForm, setShowNewProductForm] = useState<boolean>(false);
  const [newProductState, setNewProductState] = useState<Omit<Product, 'id'>>({
    name: '',
    sub: 'Handmade with love',
    desc: '',
    cat: categories[0]?.name || 'Resin Crafts',
    price: 499,
    mrp: 699,
    badge: 'New',
    stock: 1,
    vis: 1,
    img: 'coasters',
    more: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState<string>('');

  // Category manager states
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatIcon, setNewCatIcon] = useState<string>('palette');

  // Stories of works states
  const [storyImageUrl, setStoryImageUrl] = useState<string>('');
  const [storyCaption, setStoryCaption] = useState<string>('');

  // Review manager states
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewLoc, setReviewLoc] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');

  // Settings states
  const [settingsWa, setSettingsWa] = useState<string>(config.wa);
  const [settingsFee, setSettingsFee] = useState<number>(config.ship.fee);
  const [settingsFree, setSettingsFree] = useState<number>(config.ship.free);
  const [settingsIgh, setSettingsIgh] = useState<string>(config.igh);

  const newInquiriesCount = inquiries.filter((i) => i.st === 0).length;
  const newOrdersCount = orders.filter((o) => o.status === 'Confirmed').length;

  const ICONS_LIST = [
    ['palette', 'Resin Crafts (Palette)'],
    ['photo_camera', 'Custom Frames (Camera)'],
    ['local_florist', 'Crochet Bouquets (Flower)'],
    ['redeem', 'Birthday Gifts (Gift Box)'],
    ['local_fire_department', 'Candle (Flame)'],
    ['diamond', 'Diamond Gem'],
    ['image', 'Frame Picture'],
    ['favorite', 'Heart'],
    ['cake', 'Cake & Pastry'],
    ['spa', 'Leaf & Botanicals'],
    ['auto_awesome', 'Magic Sparkle'],
    ['star', 'Star'],
  ];

  const PRESET_PHOTOS = [
    { key: 'coasters', label: 'Cloud Coasters' },
    { key: 'rose', label: 'Crochet Roses' },
    { key: 'detail', label: 'Polaroid Frame' },
    { key: 'bakery', label: 'Bakery Gift Box' },
    { key: 'clock', label: 'Ocean Clock' },
    { key: 'tulip', label: 'Tulip Bouquet' },
    { key: 'spotify', label: 'Spotify Plaque' },
    { key: 'candle', label: 'Lavender Candle' },
    { key: 'tray', label: 'Gold Flake Tray' },
    { key: 'hamper', label: 'Surprise Hamper' },
    { key: 'grip', label: 'Phone Grip' },
    { key: 'frame', label: 'Floral Frame' },
  ];

  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  // Compress image in browser to max 900px, WebP under 120KB, stored directly in Firestore
  const uploadPhotoToCloud = async (file: File, _folder = 'products'): Promise<string> => {
    setIsUploadingPhoto(true);
    setUploadProgress(15);
    setUploadStatusText('Resizing to max 900px...');
    try {
      const dataUrl = await compressImageToBase64(file, 900, 120 * 1024, (p) => {
        setUploadProgress(p);
        if (p < 50) setUploadStatusText('Resizing image...');
        else if (p < 90) setUploadStatusText('Compressing to WebP (<120 KB)...');
        else setUploadStatusText('Optimized & Ready!');
      });
      showToast('Photo compressed to WebP (<120 KB)!');
      return dataUrl;
    } catch (err: any) {
      console.error('Error compressing photo:', err);
      showToast('Photo compression failed: ' + (err.message || 'Error'));
      throw err;
    } finally {
      setIsUploadingPhoto(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatusText('');
      }, 2000);
    }
  };

  const ADMIN_MENU_ITEMS = [
    { tab: 'ov', icon: 'dashboard', label: 'Dashboard / Overview', shortLabel: 'Dashboard' },
    { tab: 'orders', icon: 'local_shipping', label: 'Orders Pipeline', count: newOrdersCount, shortLabel: 'Orders' },
    { tab: 'inq', icon: 'chat_bubble_outline', label: 'Inquiries & Leads', count: newInquiriesCount, shortLabel: 'Inquiries' },
    { tab: 'prod', icon: 'inventory_2', label: 'Product Manager', shortLabel: 'Products' },
    { tab: 'cat', icon: 'category', label: 'Category Manager', shortLabel: 'Categories' },
    { tab: 'show', icon: 'auto_awesome', label: 'Showcase & Home', shortLabel: 'Showcase' },
    { tab: 'founder', icon: 'face', label: "Founder's Section", shortLabel: 'Founder' },
    { tab: 'rev', icon: 'rate_review', label: 'Customer Reviews', shortLabel: 'Reviews' },
    { tab: 'set', icon: 'settings', label: 'Store Settings', shortLabel: 'Settings' },
  ];

  const currentMenuItem =
    ADMIN_MENU_ITEMS.find((item) => item.tab === currentTab) || ADMIN_MENU_ITEMS[0];

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isDrawerOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of the admin panel?')) {
      await signOut(auth);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f4] flex flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* 1. MOBILE TOP BAR (Sticky, visible only < 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#2b352a] text-[#fcf9f4] border-b border-[#212a20] px-2 sm:px-3 py-1 flex items-center justify-between shadow-xs">
        {/* Hamburger Icon with >= 44x44px tap target */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#fcf9f4] hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
          aria-label="Open Admin Menu"
        >
          <span className="material-icon text-2xl">menu</span>
        </button>

        {/* Current Section Title */}
        <h1 className="text-xs sm:text-sm font-bold font-luxury-serif text-[#fcf9f4] truncate text-center px-2 flex-1 tracking-wide">
          {currentMenuItem.label}
        </h1>

        {/* Logout Icon with >= 44x44px tap target */}
        <button
          onClick={handleLogout}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-red-300 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
          aria-label="Logout"
          title="Logout"
        >
          <span className="material-icon text-xl">logout</span>
        </button>
      </header>

      {/* 2. MOBILE SLIDE-OUT DRAWER OVERLAY (< 1024px) */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* 2. MOBILE SLIDE-OUT DRAWER (< 1024px) */}
      <aside
        id="admin-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Admin Navigation Menu"
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[80vw] max-w-[300px] bg-[#2b352a] text-[#fcf9f4] shadow-2xl flex flex-col p-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header with Close Button */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-[#fcf9f4] font-luxury-serif text-lg font-bold">
            <img
              src={config.logo ? (IMAGES[config.logo] || config.logo) : IMAGES.logo}
              alt="Shae.made"
              className="w-7 h-7 object-contain rounded-full"
            />
            <span>Shae.made</span>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#e8eee3]/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Admin Menu"
          >
            <span className="material-icon text-2xl">close</span>
          </button>
        </div>

        {/* Drawer Menu Items List */}
        <div className="flex-1 overflow-y-auto scrollbar-none py-1 space-y-1">
          {ADMIN_MENU_ITEMS.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  navigateTo(`admin/${item.tab}`);
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#59684c] text-white shadow-xs font-bold'
                    : 'text-[#e8eee3]/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-icon text-xl">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.count ? (
                  <span className="ml-auto px-1.5 py-0.5 bg-[#d97a53] text-white text-[10px] font-bold rounded-full">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-3 border-t border-white/10 shrink-0 space-y-1">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              navigateTo('');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs font-semibold text-[#e8eee3]/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
          >
            <span className="material-icon text-lg">storefront</span>
            <span>View Storefront</span>
          </button>

          <button
            onClick={async () => {
              setIsDrawerOpen(false);
              await handleLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-xs font-semibold text-red-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
          >
            <span className="material-icon text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 4. DESKTOP PERMANENT SIDEBAR (>= 1024px) */}
      <aside className="hidden lg:flex lg:flex-col bg-[#2b352a] border-r border-[#212a20] p-4 lg:sticky lg:top-0 lg:h-screen w-[240px] shrink-0 gap-1 overflow-y-auto scrollbar-none z-20">
        <div className="flex items-center gap-2 p-2 mb-2 text-[#fcf9f4] font-luxury-serif text-xl sm:text-2xl font-bold whitespace-nowrap shrink-0">
          <img
            src={config.logo ? (IMAGES[config.logo] || config.logo) : IMAGES.logo}
            alt="Shae.made"
            className="w-7 h-7 object-contain rounded-full"
          />
          Shae.made
        </div>

        {ADMIN_MENU_ITEMS.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => navigateTo(`admin/${item.tab}`)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left ${
                isActive
                  ? 'bg-[#59684c] text-white shadow-xs font-bold'
                  : 'text-[#e8eee3]/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-icon text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.count ? (
                <span className="ml-auto px-1.5 py-0.2 bg-[#d97a53] text-white text-[10px] font-bold rounded-full">
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}

        <div className="mt-auto pt-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer"
          >
            <span className="material-icon text-lg">logout</span>
            <span>Logout</span>
          </button>
          <button
            onClick={() => navigateTo('')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#e8eee3]/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer mt-1"
          >
            <span className="material-icon text-lg">storefront</span>
            <span>View Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="p-3.5 sm:p-6 lg:p-7 max-w-5xl w-full min-w-0 pb-28 lg:pb-7 overflow-x-hidden">
        {/* Top Status & Storefront Link Bar */}
        <div className="flex items-center justify-between gap-3 p-3 sm:px-4 rounded-xl border mb-5 text-xs sm:text-sm font-bold bg-white border-[#eee7dc] text-[#59684c] shadow-xs">
          <span className="flex items-center gap-2">
            <span className="material-icon text-[#59684c]">verified</span>
            <span>Shae.made Studio Management Backend Active</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => publishChanges()}
              className="btn-order text-xs py-1.5 px-3.5 shadow-xs"
            >
              <span className="material-icon text-sm">cloud_done</span>
              <span>Backend Synced</span>
            </button>
            <button
              onClick={() => navigateTo('')}
              className="md:hidden btn-secondary text-xs py-1.5 px-2.5"
            >
              <span className="material-icon text-sm">open_in_new</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD / OVERVIEW */}
        {currentTab === 'ov' && (
          <div className="space-y-5">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                Business Dashboard & Overview
              </h1>
              <span className="text-xs text-[#737c6e] font-semibold">
                Live Studio Metrics
              </span>
            </div>

            {/* Cloud Data Persistence & Migration Card */}
            <div className="craft-card p-4 sm:p-5 bg-gradient-to-br from-[#ffffff] via-[#fcf9f4] to-[#e8eee3] border-2 border-[#59684c]/30 shadow-xs space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {lastSyncError ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Cloud Error: {lastSyncError}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Connected to cloud</span>
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-[#59684c] bg-[#e8eee3] px-2.5 py-0.5 rounded-full border border-[#d6e0ce]">
                      Last saved: {lastSyncTime || 'Synced with Firestore'}
                    </span>

                    <span className="text-[11px] font-semibold text-[#737c6e] bg-white px-2 py-0.5 rounded-full border border-[#eee7dc]">
                      {products.length} Products · {categories.length} Categories · Realtime onSnapshot
                    </span>
                  </div>

                  <h3 className="font-luxury-serif text-lg font-bold text-[#2b352a]">
                    Cloud Data Persistence & Sync
                  </h3>
                  <p className="text-xs text-[#737c6e] max-w-xl leading-relaxed">
                    All products, craft photos (WebP &lt;120 KB), categories, site settings, and orders are stored in live Firebase Firestore and synced in realtime with onSnapshot to all visitors across every device.
                  </p>
                </div>

                {!migrationStatus.complete && (
                  <button
                    type="button"
                    disabled={migrationStatus.running}
                    onClick={() => {
                      if (window.confirm("Upload all your browser's local products, photos, and settings to Firebase Cloud so other devices can see them?")) {
                        uploadLocalDataToCloud();
                      }
                    }}
                    className={`btn-order text-xs py-2 px-4 shadow-sm flex items-center gap-2 cursor-pointer ${
                      migrationStatus.running ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="material-icon text-sm">
                      {migrationStatus.running ? 'sync' : 'cloud_upload'}
                    </span>
                    <span>
                      {migrationStatus.running
                        ? 'Uploading to Cloud...'
                        : 'Upload my old local data to cloud'}
                    </span>
                  </button>
                )}

                {migrationStatus.complete && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <span className="material-icon text-sm text-emerald-600">check_circle</span>
                    <span>Cloud Data Synchronized</span>
                  </span>
                )}
              </div>

              {/* Migration Progress Indicator */}
              {migrationStatus.running && (
                <div className="p-3 rounded-xl bg-white border border-[#eee7dc] space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#59684c]">
                    <span>{migrationStatus.message}</span>
                    <span>{migrationStatus.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f5efe6] overflow-hidden">
                    <div
                      className="h-full bg-[#59684c] rounded-full transition-all duration-300"
                      style={{ width: `${migrationStatus.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {migrationStatus.error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                  <span className="material-icon text-base">error_outline</span>
                  <span>{migrationStatus.error}</span>
                </div>
              )}
            </div>

            {/* Core Metrics Cards (Confirmed Orders, AOV, Total Revenue, Overall Metrics) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="craft-card p-4">
                <small className="text-xs font-bold text-[#737c6e] uppercase">
                  Confirmed Orders
                </small>
                <b className="font-luxury-serif text-2xl font-bold text-[#59684c] block mt-1">
                  {metrics.confirmedOrdersCount}
                </b>
                <span className="text-[11px] text-[#737c6e] mt-1 block">
                  {metrics.completedCount} completed · {metrics.craftingCount} in studio
                </span>
              </div>

              <div className="craft-card p-4">
                <small className="text-xs font-bold text-[#737c6e] uppercase">
                  Total Revenue
                </small>
                <b className="font-luxury-serif text-2xl font-bold text-[#2b352a] block mt-1 tabular-nums">
                  ₹{metrics.totalRevenue.toLocaleString('en-IN')}
                </b>
                <span className="text-[11px] text-[#59684c] font-semibold mt-1 block">
                  Paid & Confirmed value
                </span>
              </div>

              <div className="craft-card p-4">
                <small className="text-xs font-bold text-[#737c6e] uppercase">
                  Average Order Value (AOV)
                </small>
                <b className="font-luxury-serif text-2xl font-bold text-[#2b352a] block mt-1 tabular-nums">
                  ₹{metrics.averageOrderValue.toLocaleString('en-IN')}
                </b>
                <span className="text-[11px] text-[#737c6e] mt-1 block">
                  Per customer order
                </span>
              </div>

              <div className="craft-card p-4">
                <small className="text-xs font-bold text-[#737c6e] uppercase">
                  Active Crafts & Stock
                </small>
                <b className="font-luxury-serif text-2xl font-bold text-[#2b352a] block mt-1">
                  {metrics.activeProductsCount} / {products.length}
                </b>
                <span className="text-[11px] text-[#d97a53] font-semibold mt-1 block">
                  {metrics.outOfStockCount} out-of-stock items
                </span>
              </div>
            </div>

            {/* Pipeline Stage Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
              <div className="craft-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-luxury-serif text-base sm:text-lg font-bold text-[#2b352a]">
                    Order Management Pipeline
                  </h3>
                  <button
                    onClick={() => navigateTo('admin/orders')}
                    className="text-xs font-bold text-[#59684c] hover:underline"
                  >
                    View Pipeline →
                  </button>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { label: 'Confirmed', count: orders.filter((o) => o.status === 'Confirmed').length, color: 'bg-blue-500' },
                    { label: 'Crafting', count: orders.filter((o) => o.status === 'Crafting').length, color: 'bg-[#59684c]' },
                    { label: 'Dispatched', count: orders.filter((o) => o.status === 'Dispatched').length, color: 'bg-amber-500' },
                    { label: 'Completed', count: orders.filter((o) => o.status === 'Completed').length, color: 'bg-emerald-600' },
                  ].map((stage) => {
                    const total = orders.length || 1;
                    const percent = Math.round((stage.count / total) * 100);
                    return (
                      <div key={stage.label} className="grid grid-cols-[100px_1fr_40px] items-center gap-2 text-xs font-semibold text-[#2b352a]">
                        <span>{stage.label}</span>
                        <div className="h-2 rounded-full bg-[#f5efe6] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <b className="text-right tabular-nums">{stage.count}</b>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-3 border-t border-[#f5efe6]">
                  <button
                    onClick={() => navigateTo('admin/orders')}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Manage Orders
                  </button>
                  <button
                    onClick={() => {
                      setShowInstagramLeadModal(true);
                      navigateTo('admin/inq');
                    }}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    + Instagram Lead
                  </button>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="craft-card p-5 space-y-3">
                <h3 className="font-luxury-serif text-base sm:text-lg font-bold text-[#2b352a]">
                  Recent Orders
                </h3>

                <div className="space-y-2">
                  {orders.slice(0, 4).map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => navigateTo('admin/orders')}
                      className="p-2.5 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] hover:border-[#59684c] transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-[#2b352a]">
                          {ord.customerName}
                        </span>
                        <b className="text-xs font-bold text-[#59684c] tabular-nums">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </b>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-[#737c6e] mt-1">
                        <span className="truncate max-w-[150px]">
                          {ord.items.map((i) => i.name).join(', ')}
                        </span>
                        <span className="badge-tag-peach text-[9.5px] py-0.2">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT PIPELINE */}
        {currentTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                  Order Management Pipeline
                </h1>
                <p className="text-xs text-[#737c6e]">
                  Manage studio crafting, track dispatch status, and send WhatsApp updates.
                </p>
              </div>
              <span className="text-xs font-bold text-[#59684c] bg-[#e8eee3] px-3 py-1 rounded-full">
                {orders.length} Total Orders
              </span>
            </div>

            {/* Filter Tabs for Status Pipeline */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Confirmed', 'Crafting', 'Dispatched', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    orderStatusFilter === st
                      ? 'bg-[#59684c] text-white shadow-xs font-bold'
                      : 'bg-white border border-[#eee7dc] text-[#2b352a] hover:border-[#59684c]'
                  }`}
                >
                  {st} (
                  {st === 'All'
                    ? orders.length
                    : orders.filter((o) => o.status === st).length}
                  )
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-icon absolute left-3 top-2 text-[#737c6e] text-base">
                search
              </span>
              <input
                type="text"
                placeholder="Search orders by customer name, phone, items or address..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a] focus:outline-none focus:border-[#59684c]"
              />
            </div>

            {/* Orders Cards Grid */}
            <div className="space-y-3">
              {orders
                .filter((o) => {
                  const matchStatus =
                    orderStatusFilter === 'All' || o.status === orderStatusFilter;
                  const matchQuery =
                    !orderSearchQuery.trim() ||
                    (
                      o.customerName +
                      o.phone +
                      o.address +
                      o.items.map((i) => i.name).join(' ') +
                      o.id
                    )
                      .toLowerCase()
                      .includes(orderSearchQuery.toLowerCase().trim());
                  return matchStatus && matchQuery;
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className="craft-card p-4 sm:p-5 bg-white border border-[#eee7dc] space-y-3"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-luxury-serif font-bold text-sm sm:text-base text-[#2b352a]">
                          {order.id}
                        </span>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#f5efe6] text-[#737c6e]">
                          Source: {order.source || 'Storefront'}
                        </span>
                        <span className="text-[11px] text-[#737c6e]">
                          {order.createdAt}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#737c6e]">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as Order['status'])
                          }
                          className="px-2.5 py-1 rounded-xl border border-[#eee7dc] bg-[#fcf9f4] text-xs font-bold text-[#59684c] focus:outline-none"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Crafting">Crafting</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#fcf9f4] border border-[#eee7dc] text-xs">
                      <div>
                        <b className="text-[11px] font-bold text-[#737c6e] uppercase block mb-0.5">
                          Customer
                        </b>
                        <b className="text-xs font-bold text-[#2b352a] block">
                          {order.customerName}
                        </b>
                        <div className="flex items-center gap-1.5 text-[11.5px] text-[#59684c] mt-0.5">
                          <span>📞 {order.phone}</span>
                          <button
                            onClick={() =>
                              openWhatsApp(
                                `Hi ${order.customerName}! 🌿 Reaching out from Shae.made regarding your order #${order.id}.`,
                                order.phone
                              )
                            }
                            className="text-[10px] underline font-bold"
                          >
                            Chat
                          </button>
                        </div>
                      </div>

                      <div>
                        <b className="text-[11px] font-bold text-[#737c6e] uppercase block mb-0.5">
                          Delivery Address
                        </b>
                        <p className="text-xs text-[#2b352a]">
                          {order.address}
                          {order.city && `, ${order.city}`}
                          {order.pincode && ` - ${order.pincode}`}
                        </p>
                      </div>
                    </div>

                    {/* Items List with Photos */}
                    <div>
                      <b className="text-[11px] font-bold text-[#737c6e] uppercase block mb-1.5">
                        Items Ordered
                      </b>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#eee7dc]"
                          >
                            {item.img && (
                              <img
                                src={item.img}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-[#eee7dc] shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0 text-xs">
                              <b className="text-[#2b352a] block truncate">
                                {item.name} (x{item.q})
                              </b>
                              {item.note && (
                                <p className="text-[10.5px] text-[#737c6e] truncate">
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <b className="text-xs text-[#59684c] tabular-nums shrink-0">
                              ₹{(item.price * item.q).toLocaleString('en-IN')}
                            </b>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total & Paid Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#f5efe6] flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleOrderPaid(order.id)}
                            className={`toggle-switch ${order.paid ? 'on' : ''}`}
                          />
                          <span className="text-xs font-semibold text-[#2b352a]">
                            {order.paid ? 'Payment Received' : 'Payment Pending'}
                          </span>
                        </div>

                        {/* Tracking Input */}
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Tracking No (DTDC/IndiaPost)..."
                            value={
                              trackingInputs[order.id] !== undefined
                                ? trackingInputs[order.id]
                                : order.trackingNumber || ''
                            }
                            onChange={(e) =>
                              setTrackingInputs((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="px-2 py-1 rounded-lg border border-[#eee7dc] bg-[#fcf9f4] text-xs text-[#2b352a] w-36"
                          />
                          <button
                            onClick={() => {
                              const tracking = trackingInputs[order.id] || '';
                              updateOrderTracking(order.id, tracking);
                            }}
                            className="btn-secondary text-[10.5px] py-1 px-2"
                          >
                            Save Tracking
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <b className="text-sm font-bold text-[#2b352a] tabular-nums">
                          Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                        </b>

                        <button
                          onClick={() => {
                            const trackingMsg = order.trackingNumber
                              ? `📦 Your parcel has been dispatched! Tracking: ${order.trackingNumber}`
                              : `🌿 Your handcrafted keepsake is currently ${order.status.toLowerCase()}!`;
                            openWhatsApp(
                              `Hi ${order.customerName}! Update on your Shae.made order #${order.id}: ${trackingMsg}`,
                              order.phone
                            );
                          }}
                          className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                        >
                          <span className="material-icon text-xs text-[#2fb36f]">chat</span>
                          <span>WhatsApp Update</span>
                        </button>

                        <button
                          onClick={() => {
                            deleteOrder(order.id);
                          }}
                          className="btn-secondary text-xs py-1 px-2 text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: INQUIRIES & CUSTOMER CHATS (WITH INSTAGRAM LEADS INTEGRATION) */}
        {currentTab === 'inq' && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                  Inquiries & Customer Chats
                </h1>
                <p className="text-xs text-[#737c6e]">
                  Manage direct inquiries, WhatsApp chats, and Instagram leads.
                </p>
              </div>

              <button
                onClick={() => setShowInstagramLeadModal(true)}
                className="btn-primary text-xs py-1.5 px-3.5 shadow-xs flex items-center gap-1.5"
              >
                <span className="material-icon text-sm">photo_camera</span>
                <span>+ Add Instagram Lead</span>
              </button>
            </div>

            {/* Modal for adding Instagram Lead */}
            {showInstagramLeadModal && (
              <div className="craft-card p-4 bg-white border-2 border-[#59684c] space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#f5efe6] pb-2">
                  <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                    Add New Instagram / Social Lead
                  </h3>
                  <button
                    onClick={() => setShowInstagramLeadModal(false)}
                    className="btn-secondary w-7 h-7 p-0 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={instagramLeadForm.name}
                    onChange={(e) =>
                      setInstagramLeadForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                  />
                  <input
                    type="text"
                    placeholder="Instagram Handle (e.g. @craft_lover)"
                    value={instagramLeadForm.handle}
                    onChange={(e) =>
                      setInstagramLeadForm((f) => ({ ...f, handle: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Phone Number"
                    value={instagramLeadForm.phone}
                    onChange={(e) =>
                      setInstagramLeadForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                  />
                  <input
                    type="text"
                    placeholder="Craft Item Requested"
                    value={instagramLeadForm.item}
                    onChange={(e) =>
                      setInstagramLeadForm((f) => ({ ...f, item: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                  />
                  <input
                    type="number"
                    placeholder="Quoted Amount ₹"
                    value={instagramLeadForm.total}
                    onChange={(e) =>
                      setInstagramLeadForm((f) => ({ ...f, total: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                  />
                  <input
                    type="text"
                    placeholder="Notes (Reel link, colors, date)"
                    value={instagramLeadForm.memo}
                    onChange={(e) =>
                      setInstagramLeadForm((f) => ({ ...f, memo: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (!instagramLeadForm.name.trim()) {
                        showToast('Please enter customer name');
                        return;
                      }
                      addInstagramLead({
                        name: instagramLeadForm.name,
                        handle: instagramLeadForm.handle || '@instagram_user',
                        phone: instagramLeadForm.phone,
                        item: instagramLeadForm.item || 'Custom Craft',
                        total: Number(instagramLeadForm.total) || 0,
                        memo: instagramLeadForm.memo,
                      });
                      setInstagramLeadForm({
                        name: '',
                        handle: '',
                        phone: '',
                        item: '',
                        total: '',
                        memo: '',
                      });
                      setShowInstagramLeadModal(false);
                    }}
                    className="btn-order text-xs py-1.5 px-4 shadow-sm"
                  >
                    Save Instagram Lead
                  </button>
                </div>
              </div>
            )}

            {/* Inquiries List & Chat Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4 items-start">
              {/* Left Column: Inquiry Cards */}
              <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
                {inquiries.map((inq) => {
                  const isSelected = selectedInquiryId === inq.id;
                  return (
                    <div
                      key={inq.id}
                      onClick={() => setSelectedInquiryId(inq.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#59684c] shadow-sm ring-1 ring-[#59684c]'
                          : 'bg-[#fffcf5] border-[#eee7dc] hover:border-[#59684c]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <b className="text-xs sm:text-sm text-[#2b352a] truncate">{inq.name}</b>
                        <small className="text-[10.5px] text-[#737c6e]">{inq.time}</small>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#e8eee3] text-[#34402c]">
                          {inq.platform || 'Storefront'}
                        </span>
                        {inq.handle && (
                          <span className="text-[10.5px] text-[#59684c] font-semibold">
                            {inq.handle}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-baseline gap-2 mt-1.5">
                        <span className="text-xs text-[#2b352a] font-semibold truncate">
                          {inq.item}
                        </span>
                        <b className="text-xs font-bold text-[#59684c] tabular-nums">
                          ₹{inq.total.toLocaleString('en-IN')}
                        </b>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Chat CRM Details & Reply Templates */}
              {(() => {
                const active = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0];
                if (!active) return null;

                return (
                  <div className="craft-card p-4 sm:p-5 bg-white border border-[#eee7dc] space-y-3.5">
                    <div className="flex justify-between items-start border-b border-[#f5efe6] pb-2">
                      <div>
                        <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                          {active.name}
                        </h3>
                        <p className="text-[11px] text-[#737c6e]">
                          {active.platform} · {active.loc} · {active.phone || 'No phone'}
                        </p>
                      </div>

                      <span className="badge-tag-peach text-[10px]">
                        {STAGES[active.st]}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#fcf9f4] border border-[#eee7dc] text-xs">
                      <b className="block text-[#59684c] mb-0.5">Item Requested:</b>
                      <p className="font-semibold text-[#2b352a]">{active.item}</p>
                      <b className="block text-[#59684c] mt-2 mb-0.5">Estimated Value:</b>
                      <p className="font-bold text-[#2b352a]">₹{active.total.toLocaleString('en-IN')}</p>
                    </div>

                    {/* Quick WhatsApp Templates */}
                    <div className="space-y-1.5">
                      <b className="text-xs text-[#2b352a] block">Quick WhatsApp Reply Templates:</b>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {[
                          {
                            label: 'Instagram Inquiry Reply',
                            msg: `Hi ${active.name}! 🌿 Thank you for reaching out from Instagram about our handcrafted "${active.item}". We would love to make this for you!`,
                          },
                          {
                            label: 'Confirm Order & UPI',
                            msg: `Hi ${active.name}! Your order for "${active.item}" is confirmed. Total: ₹${active.total}. Please pay via UPI to confirm dispatch schedule.`,
                          },
                          {
                            label: 'Ask for Photos',
                            msg: `Hi ${active.name}! Please send your photos as high-res "Documents" on WhatsApp for crystal clarity in resin! 📸`,
                          },
                          {
                            label: 'Dispatch Update',
                            msg: `Great news ${active.name}! 📦 Your handcrafted package from Shae.made has been carefully wrapped and dispatched!`,
                          },
                        ].map((t) => (
                          <button
                            key={t.label}
                            onClick={() => openWhatsApp(t.msg, active.phone)}
                            className="btn-secondary text-[10.5px] py-1 px-2 text-left justify-start"
                          >
                            <span className="material-icon text-xs text-[#2fb36f]">send</span>
                            <span className="truncate">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-[#f5efe6]">
                      <button
                        onClick={() => deleteInquiry(active.id)}
                        className="btn-secondary text-xs py-1 px-2.5 text-red-600"
                      >
                        Delete Lead
                      </button>

                      <button
                        onClick={() => updateInquiryStage(active.id, Math.min(4, active.st + 1))}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        Advance Status →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCT MANAGEMENT (UP TO 10 PHOTOS, TAGS, STOCK CONTROLS) */}
        {currentTab === 'prod' && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                  Product & Inventory Manager
                </h1>
                <p className="text-xs text-[#737c6e]">
                  Manage craft catalog, upload 5 to 10 photos per product, and control stock.
                </p>
              </div>

              <button
                onClick={() => setShowNewProductForm((v) => !v)}
                className="btn-primary text-xs py-1.5 px-3.5"
              >
                <span className="material-icon text-sm">add</span>
                {showNewProductForm ? 'Close Form' : 'New Craft'}
              </button>
            </div>

            {/* CREATE NEW CRAFT FORM - WITH UP TO 10 PHOTOS */}
            {showNewProductForm && (
              <div className="craft-card p-5 bg-white border-2 border-[#59684c] space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-[#f5efe6] pb-2">
                  <h3 className="font-luxury-serif text-lg font-bold text-[#2b352a]">
                    Add New Craft Product
                  </h3>
                  <button
                    onClick={() => setShowNewProductForm(false)}
                    className="btn-secondary w-7 h-7 p-0 text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Photo Management: Up to 10 images supported */}
                <div className="p-4 rounded-xl bg-[#fcf9f4] border border-[#eee7dc] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <b className="text-xs font-bold text-[#2b352a] block">
                        Product Photography (Upload 5 to 10 photos)
                      </b>
                      <small className="text-[11px] text-[#737c6e]">
                        Upload high-res images from your device, paste web links, or pick from presets.
                      </small>
                    </div>
                    <span className="text-[10.5px] font-bold text-[#59684c] bg-[#e8eee3] px-2.5 py-0.5 rounded-full">
                      Cover + Gallery
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="btn-primary text-xs py-1.5 px-3 cursor-pointer">
                      <span className="material-icon text-sm">add_photo_alternate</span>
                      <span>{isUploadingPhoto ? 'Processing photo...' : 'Upload Photos (WebP <120 KB)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingPhoto}
                        hidden
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          showToast(`Optimizing ${files.length} photo(s)...`);
                          try {
                            for (let i = 0; i < Math.min(files.length, 10); i++) {
                              const cloudUrl = await uploadPhotoToCloud(files[i]);
                              setNewProductState((s) => {
                                if (i === 0 && (!s.img || s.img === 'coasters')) {
                                  return { ...s, img: cloudUrl };
                                } else {
                                  return {
                                    ...s,
                                    img: s.img && s.img !== 'coasters' ? s.img : cloudUrl,
                                    more: [...(s.more || []), cloudUrl].slice(0, 9),
                                  };
                                }
                              });
                            }
                            showToast(`${files.length} photo(s) optimized & added!`);
                          } catch (err: any) {
                            showToast('Upload error: ' + (err.message || 'Failed'));
                          } finally {
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>

                    {uploadProgress > 0 && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#59684c] bg-white px-3 py-1 rounded-xl border border-[#eee7dc]">
                        <div className="w-20 h-1.5 bg-[#eee7dc] rounded-full overflow-hidden">
                          <div
                            className="bg-[#59684c] h-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-[11px]">{uploadStatusText} ({uploadProgress}%)</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                      <input
                        type="url"
                        placeholder="Or paste web image link..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[#eee7dc] bg-white text-xs text-[#2b352a] flex-1"
                      />
                      <button
                        onClick={() => {
                          if (!imageUrlInput.trim()) return;
                          setNewProductState((s) => ({
                            ...s,
                            more: [...(s.more || []), imageUrlInput.trim()].slice(0, 9),
                          }));
                          setImageUrlInput('');
                          showToast('Photo added');
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Preset photo chips */}
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_PHOTOS.map((pr) => (
                      <button
                        key={pr.key}
                        type="button"
                        onClick={() => {
                          setNewProductState((s) => ({ ...s, img: pr.key }));
                          showToast(`Set ${pr.label} as cover`);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#eee7dc] bg-white text-[10px] text-[#2b352a] hover:border-[#59684c] shrink-0"
                      >
                        <img src={IMAGES[pr.key]} alt="" className="w-4 h-4 rounded object-cover" />
                        <span>{pr.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields: Name, Category, Price, MRP, Tags, Tagline, Detailed Desc */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs font-bold block mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={newProductState.name}
                      onChange={(e) => setNewProductState((s) => ({ ...s, name: e.target.value }))}
                      placeholder="e.g. Ocean Wave Resin Clock"
                      className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Category</label>
                    <select
                      value={newProductState.cat}
                      onChange={(e) => setNewProductState((s) => ({ ...s, cat: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Tag / Badge</label>
                    <input
                      type="text"
                      value={newProductState.badge}
                      onChange={(e) => setNewProductState((s) => ({ ...s, badge: e.target.value }))}
                      placeholder="e.g. Bestseller, HOT, New"
                      className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Selling Price ₹ *</label>
                    <input
                      type="number"
                      value={newProductState.price}
                      onChange={(e) =>
                        setNewProductState((s) => ({ ...s, price: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">MRP ₹</label>
                    <input
                      type="number"
                      value={newProductState.mrp}
                      onChange={(e) =>
                        setNewProductState((s) => ({ ...s, mrp: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Tagline / Short Line</label>
                    <input
                      type="text"
                      value={newProductState.sub}
                      onChange={(e) => setNewProductState((s) => ({ ...s, sub: e.target.value }))}
                      placeholder="e.g. Handmade wall clock, resin"
                      className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Detailed Description</label>
                  <textarea
                    rows={2}
                    value={newProductState.desc}
                    onChange={(e) => setNewProductState((s) => ({ ...s, desc: e.target.value }))}
                    placeholder="Describe resin clarity, flower petals, dimensions, packaging..."
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (!newProductState.name.trim()) return showToast('Please enter craft name');
                      saveNewProduct(newProductState);
                      setShowNewProductForm(false);
                      setNewProductState({
                        name: '',
                        sub: 'Handmade with love',
                        desc: '',
                        cat: categories[0]?.name || 'Resin Crafts',
                        price: 499,
                        mrp: 699,
                        badge: 'New',
                        stock: 1,
                        vis: 1,
                        img: 'coasters',
                        more: [],
                      });
                    }}
                    className="btn-order text-xs py-2 px-4 shadow-sm"
                  >
                    Save Craft Product
                  </button>
                </div>
              </div>
            )}

            {/* EDIT PRODUCT MODAL (UP TO 10 PHOTOS, SMOOTH LOCAL TYPING) */}
            {editingProductId && editForm && (() => {
              const allPhotos = [editForm.img, ...(editForm.more || [])].filter(Boolean);

              const handleFieldChange = (field: keyof Product, value: any) => {
                setEditForm((prev) => (prev ? { ...prev, [field]: value } : null));
              };

              const commitChanges = () => {
                if (editForm) {
                  updateProductFull(editForm.id, editForm);
                }
              };

              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                  <div className="bg-white border-2 border-[#59684c] rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#f5efe6] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#59684c] uppercase tracking-wider">
                          Product Photography & Details
                        </span>
                        <h2 className="font-luxury-serif text-lg font-bold text-[#2b352a]">
                          Edit: {editForm.name}
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          commitChanges();
                          setEditingProductId(null);
                        }}
                        className="btn-secondary w-7 h-7 p-0 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Up to 10 photos grid */}
                    <div className="p-3.5 rounded-2xl bg-[#fcf9f4] border border-[#eee7dc] space-y-3">
                      <div className="flex items-center justify-between">
                        <b className="text-xs font-bold text-[#2b352a]">
                          Product Photos ({allPhotos.length}/10)
                        </b>
                        <span className="text-[10.5px] font-bold text-[#59684c] bg-[#e8eee3] px-2 py-0.5 rounded-full">
                          First photo = Cover
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap items-center">
                        {allPhotos.map((src, i) => (
                          <div
                            key={i}
                            className={`relative w-18 h-18 rounded-xl overflow-hidden border-2 bg-white ${
                              i === 0 ? 'border-[#59684c]' : 'border-[#eee7dc]'
                            }`}
                          >
                            <img src={IMAGES[src] || src} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeProductPhoto(editForm.id, i)}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                            >
                              ✕
                            </button>
                            {i === 0 ? (
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-[#59684c] text-white text-[8.5px] font-bold">
                                Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => updateProductPhotoCover(editForm.id, i)}
                                className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/75 hover:bg-[#59684c] text-white text-[8px] font-bold"
                              >
                                Set Cover
                              </button>
                            )}
                          </div>
                        ))}

                        {allPhotos.length < 10 && (
                          <label className="w-18 h-18 rounded-xl border-2 border-dashed border-[#59684c]/40 bg-white flex flex-col items-center justify-center text-[#59684c] cursor-pointer text-xs font-semibold">
                            <span className="material-icon text-xl">add_photo_alternate</span>
                            <span className="text-[9.5px]">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length === 0) return;
                                showToast(`Optimizing ${files.length} photo(s)...`);
                                try {
                                  for (const f of files) {
                                    const cloudUrl = await uploadPhotoToCloud(f);
                                    await addProductPhoto(editForm.id, cloudUrl);
                                  }
                                  showToast('Photos optimized & saved to cloud!');
                                } catch (err: any) {
                                  showToast('Upload error: ' + (err.message || 'Error'));
                                } finally {
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-xs font-bold block mb-1">Product Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          onBlur={commitChanges}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Category</label>
                        <select
                          value={editForm.cat}
                          onChange={(e) => {
                            handleFieldChange('cat', e.target.value);
                            updateProductFull(editForm.id, { cat: e.target.value });
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                        >
                          {categories.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={editForm.badge}
                          onChange={(e) => handleFieldChange('badge', e.target.value)}
                          onBlur={commitChanges}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Price ₹</label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                          onBlur={commitChanges}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">MRP ₹</label>
                        <input
                          type="number"
                          value={editForm.mrp}
                          onChange={(e) => handleFieldChange('mrp', Number(e.target.value))}
                          onBlur={commitChanges}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">Tagline</label>
                        <input
                          type="text"
                          value={editForm.sub}
                          onChange={(e) => handleFieldChange('sub', e.target.value)}
                          onBlur={commitChanges}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1">Detailed Description</label>
                      <textarea
                        rows={2}
                        value={editForm.desc || ''}
                        onChange={(e) => handleFieldChange('desc', e.target.value)}
                        onBlur={commitChanges}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                      />
                    </div>

                    {/* Stock & Visibility Toggles */}
                    <div className="flex items-center gap-6 p-3 rounded-xl bg-[#fcf9f4] border border-[#eee7dc]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateProductInline(editForm.id, 'stock', editForm.stock ? 0 : 1)}
                          className={`toggle-switch ${editForm.stock ? 'on' : ''}`}
                        />
                        <span className="text-xs font-semibold text-[#2b352a]">
                          {editForm.stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateProductInline(editForm.id, 'vis', editForm.vis ? 0 : 1)}
                          className={`toggle-switch ${editForm.vis ? 'on' : ''}`}
                        />
                        <span className="text-xs font-semibold text-[#2b352a]">
                          {editForm.vis ? 'Visible on Store' : 'Hidden from Store'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f5efe6]">
                      <button
                        onClick={() => {
                          if (confirm(`Delete craft "${editForm.name}"?`)) {
                            deleteProduct(editForm.id);
                            setEditingProductId(null);
                          }
                        }}
                        className="btn-secondary text-xs py-2 px-3 text-red-600 font-bold"
                      >
                        Delete Craft
                      </button>

                      <button
                        onClick={() => {
                          commitChanges();
                          setEditingProductId(null);
                        }}
                        className="btn-order text-xs py-2 px-5 shadow-sm"
                      >
                        Done Editing
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Products Table with Quick Stock Toggles */}
            <div className="craft-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[660px] text-xs text-left">
                  <thead className="bg-[#f5efe6] text-[#737c6e] uppercase font-bold text-[10.5px] border-b border-[#eee7dc]">
                    <tr>
                      <th className="p-3 w-16">Cover</th>
                      <th className="p-3">Craft Details</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 w-20">Price ₹</th>
                      <th className="p-3 w-20">MRP ₹</th>
                      <th className="p-3 text-center">In Stock</th>
                      <th className="p-3 text-center">Visible</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee7dc]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#fcf9f4]/80">
                        <td className="p-3">
                          <img
                            src={getProductCover(p)}
                            alt=""
                            onClick={() => setEditingProductId(p.id)}
                            className="w-12 h-12 object-cover rounded-xl border border-[#eee7dc] cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <b className="text-xs text-[#2b352a] block">{p.name}</b>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#737c6e]">
                            <span>ID: {p.id}</span>
                            <span>·</span>
                            <span className="text-[#59684c] font-semibold">
                              📷 {getProductGallery(p).length} photo(s)
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-[#737c6e]">{p.cat}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={p.price}
                            onChange={(e) =>
                              updateProductInline(p.id, 'price', Number(e.target.value))
                            }
                            className="w-18 px-2 py-1 rounded-lg border border-[#eee7dc] bg-white text-xs font-bold"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={p.mrp}
                            onChange={(e) =>
                              updateProductInline(p.id, 'mrp', Number(e.target.value))
                            }
                            className="w-18 px-2 py-1 rounded-lg border border-[#eee7dc] bg-white text-xs font-bold"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => updateProductInline(p.id, 'stock', p.stock ? 0 : 1)}
                            className={`toggle-switch ${p.stock ? 'on' : ''}`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => updateProductInline(p.id, 'vis', p.vis ? 0 : 1)}
                            className={`toggle-switch ${p.vis ? 'on' : ''}`}
                          />
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setEditingProductId(p.id)}
                            className="btn-secondary text-[11px] py-1 px-2.5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              deleteProduct(p.id);
                            }}
                            className="btn-secondary text-[11px] py-1 px-2 text-red-600"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORY MANAGEMENT */}
        {currentTab === 'cat' && (
          <div className="space-y-4">
            <div>
              <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                Category Manager
              </h1>
              <p className="text-xs text-[#737c6e]">
                Add, edit, or rearrange categories and control where they appear on the storefront.
              </p>
            </div>

            {/* Add Category Card */}
            <div className="craft-card p-4 sm:p-5 bg-white border border-[#eee7dc] space-y-3">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                Add New Category
              </h3>
              <div className="flex gap-2 flex-wrap items-center">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Clay Miniature)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a] flex-1 min-w-[180px]"
                />
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                >
                  {ICONS_LIST.map(([ic, label]) => (
                    <option key={ic} value={ic}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (await addCategory(newCatName, newCatIcon)) {
                      setNewCatName('');
                    }
                  }}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Add Category
                </button>
              </div>
            </div>

            {/* Categories List with Reordering */}
            <div className="craft-card overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f5efe6] text-[#737c6e] uppercase font-bold text-[10.5px] border-b border-[#eee7dc]">
                  <tr>
                    <th className="p-3 w-16">Icon</th>
                    <th className="p-3">Category Name</th>
                    <th className="p-3 text-center">Crafts Count</th>
                    <th className="p-3 text-center w-28">Rearrange</th>
                    <th className="p-3 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee7dc]">
                  {categories.map((cat, idx) => (
                    <tr key={cat.name} className="hover:bg-[#fcf9f4]/80">
                      <td className="p-3">
                        <span className="material-icon text-lg text-[#59684c]">{cat.icon}</span>
                      </td>
                      <td className="p-3 font-bold text-[#2b352a]">{cat.name}</td>
                      <td className="p-3 text-center tabular-nums">
                        {products.filter((p) => p.cat === cat.name).length} crafts
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveCategory(idx, -1)}
                          className="w-6 h-6 rounded border border-[#eee7dc] bg-white disabled:opacity-40"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          disabled={idx === categories.length - 1}
                          onClick={() => moveCategory(idx, 1)}
                          className="w-6 h-6 rounded border border-[#eee7dc] bg-white disabled:opacity-40"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteCategory(idx)}
                          className="text-red-600 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SHOWCASE & HOME MANAGEMENT */}
        {currentTab === 'show' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                Showcase & Homepage Content
              </h1>
              <p className="text-xs text-[#737c6e]">
                Directly edit hero banner, announcements, select Trending Products, and manage Stories of Works.
              </p>
            </div>

            {/* Hero Announcements & Titles */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-3.5">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                Hero Banner & Announcements
              </h3>

              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-bold block mb-1">
                    Top Announcement Ticker
                  </label>
                  <input
                    type="text"
                    value={heroSettings.tick}
                    onChange={(e) => updateHeroSettings({ tick: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Hero Title</label>
                  <input
                    type="text"
                    value={heroSettings.title}
                    onChange={(e) => updateHeroSettings({ title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Hero Subtitle</label>
                  <input
                    type="text"
                    value={heroSettings.sub}
                    onChange={(e) => updateHeroSettings({ sub: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>
              </div>
            </div>

            {/* Hero Section Image Management */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-3.5">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                Hero Section Showcase Image
              </h3>
              <p className="text-xs text-[#737c6e]">
                Upload or select the featured craft image displayed prominently in the homepage hero section.
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#eee7dc] bg-[#fcf9f4] shrink-0">
                  <img
                    src={heroSettings.img ? (IMAGES[heroSettings.img] || heroSettings.img) : IMAGES.coasters}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 flex-1 min-w-[200px]">
                  <label className="btn-secondary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5">
                    <span className="material-icon text-base">cloud_upload</span>
                    <span>Upload New Hero Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await uploadPhotoToCloud(file, 'hero');
                            await updateHeroSettings({ img: url });
                          } catch (err: any) {
                            showToast('Failed to upload hero image');
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <select
                      value={heroSettings.img || 'coasters'}
                      onChange={(e) => updateHeroSettings({ img: e.target.value })}
                      className="px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs font-semibold text-[#2b352a] bg-white"
                    >
                      {PRESET_PHOTOS.map((p) => (
                        <option key={p.key} value={p.key}>
                          Preset: {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Select & Showcase Trending Products from Product List */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                    Select Trending Products for Homepage
                  </h3>
                  <small className="text-[11px] text-[#737c6e]">
                    Pick which crafted items appear in the 6 Trending Picks slots on the storefront.
                  </small>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                  const currentId = heroSettings.slots[slotIdx];
                  const currentProd = products.find((p) => p.id === currentId);

                  return (
                    <div
                      key={slotIdx}
                      className="p-3 rounded-2xl border border-[#eee7dc] bg-[#fcf9f4] space-y-2"
                    >
                      <span className="text-[10px] font-bold text-[#59684c] uppercase">
                        Slot #{slotIdx + 1}
                      </span>
                      {currentProd && (
                        <div className="relative aspect-square rounded-xl overflow-hidden border border-[#eee7dc] bg-white">
                          <img
                            src={getProductCover(currentProd)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <select
                        value={currentId || ''}
                        onChange={(e) => setTrendingSlot(slotIdx, e.target.value)}
                        className="w-full px-2 py-1 rounded-xl border border-[#eee7dc] bg-white text-xs font-bold text-[#2b352a]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stories of Works (Image Upload capability) */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                    Stories of Works Gallery
                  </h3>
                  <p className="text-xs text-[#737c6e]">
                    Upload studio behind-the-scenes and finished craft photos.
                  </p>
                </div>

                <label className="btn-primary text-xs py-1.5 px-3 cursor-pointer">
                  <span className="material-icon text-sm">cloud_upload</span>
                  <span>Upload Story Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        try {
                          const url = await uploadPhotoToCloud(f, 'stories');
                          await addStoryPhoto(url, 'Craft story');
                        } catch (err: any) {
                          showToast('Story photo upload failed');
                        }
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {/* Stories Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {stories.map((st, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[#eee7dc] group bg-white shadow-xs"
                  >
                    <img
                      src={IMAGES[st.img] || st.img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => deleteStoryItem(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center text-[10px]"
                      title="Remove story"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder's Section Quick Jump Card in Showcase & Home */}
            <div className="craft-card p-5 bg-[#f5efe6] border border-[#ded5c7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0 bg-white">
                  <img
                    src={IMAGES[founderSettings.img] || founderSettings.img || IMAGES.artisan}
                    alt={founderSettings.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#59684c] uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full inline-block mb-1">
                    {founderSettings.badge}
                  </span>
                  <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                    Founder & Artisan Section: {founderSettings.name} ({founderSettings.role})
                  </h3>
                  <p className="text-xs text-[#737c6e] line-clamp-1 max-w-md">
                    {founderSettings.bio}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('admin/founder')}
                className="btn-primary text-xs py-2 px-4 whitespace-nowrap shadow-xs"
              >
                <span className="material-icon text-sm">edit</span>
                <span>Manage Founder Section</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: FOUNDER'S SECTION MANAGEMENT */}
        {currentTab === 'founder' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                  Founder & Artisan Profile Management
                </h1>
                <p className="text-xs text-[#737c6e]">
                  Manage the Founder's profile image, biographical story, personal quote, role title, and direct WhatsApp contact.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Reset Founder's section to original default profile?")) {
                      resetFounderToDefault();
                      setFounderForm(INITIAL_FOUNDER);
                    }
                  }}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <span className="material-icon text-sm">restart_alt</span>
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateFounderSettings(founderForm);
                  }}
                  className="btn-order text-xs py-1.5 px-4 shadow-xs"
                >
                  <span className="material-icon text-sm">save</span>
                  <span>Save Founder Section</span>
                </button>
              </div>
            </div>

            {/* Live Storefront Preview Card */}
            <div className="craft-card p-5 bg-gradient-to-br from-[#ffffff] via-[#fcf9f4] to-[#f5efe6] border border-[#ded5c7] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#59684c] uppercase tracking-wider">
                  <span className="material-icon text-base">visibility</span>
                  <span>Live Storefront Preview (Customer View)</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    founderForm.showSection !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {founderForm.showSection !== false ? '● Visible on Store' : '○ Hidden from Store'}
                </span>
              </div>

              {/* Exact Home Screen Card Representation */}
              <div className="bg-[#f5efe6] border border-[#eee7dc] rounded-[20px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left transition-all">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                    <img
                      src={IMAGES[founderForm.img] || founderForm.img || IMAGES.artisan}
                      alt={founderForm.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#59684c] border-2 border-white flex items-center justify-center text-[10px] text-white">
                    {founderForm.badgeIcon || '🌿'}
                  </span>
                </div>

                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-bold text-[#59684c] uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full inline-block">
                    {founderForm.badge || 'Meet the Maker & Studio'}
                  </span>
                  <h3 className="font-luxury-serif text-base sm:text-lg font-bold text-[#2b352a]">
                    {founderForm.name}{founderForm.role ? ` · ${founderForm.role}` : ''}
                  </h3>
                  <p className="text-xs text-[#737c6e] leading-relaxed">
                    “{founderForm.bio.replace(/^[“"']+|[”"']+$/g, '')}”
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      className="btn-primary text-xs py-1.5 px-3 pointer-events-none opacity-95"
                    >
                      <span className="material-icon text-xs">chat</span>
                      <span>{founderForm.chatBtnText || `Chat with ${founderForm.name}`}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-xs py-1.5 px-3 pointer-events-none opacity-95"
                    >
                      <span>{founderForm.secondaryBtnText || 'Request Bespoke Idea'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: Founder Photo & Visuals */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-4">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a] flex items-center gap-2">
                <span className="material-icon text-lg text-[#59684c]">add_a_photo</span>
                <span>Founder Image & Portrait</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#59684c] bg-[#fcf9f4] shadow-sm">
                    <img
                      src={IMAGES[founderForm.img] || founderForm.img || IMAGES.artisan}
                      alt="Founder Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#59684c] border-2 border-white flex items-center justify-center text-xs text-white">
                    {founderForm.badgeIcon || '🌿'}
                  </span>
                </div>

                <div className="space-y-3 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-primary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                      <span className="material-icon text-base">cloud_upload</span>
                      <span>Upload Founder Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadPhotoToCloud(file, 'founder');
                              setFounderForm((prev) => ({ ...prev, img: url }));
                            } catch (err: any) {
                              showToast('Founder photo upload failed');
                            }
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setFounderForm((prev) => ({ ...prev, img: 'artisan' }))}
                      className="btn-secondary text-xs py-2 px-3"
                    >
                      Use Original Portrait
                    </button>
                  </div>

                  {/* Or Image URL */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Or paste direct image URL (https://...)"
                      value={founderUrlInput}
                      onChange={(e) => setFounderUrlInput(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a] flex-1 min-w-[200px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (founderUrlInput.trim()) {
                          setFounderForm((prev) => ({ ...prev, img: founderUrlInput.trim() }));
                          setFounderUrlInput('');
                          showToast('Founder image URL applied');
                        }
                      }}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Apply URL
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#737c6e]">
                      Or choose from studio presets:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { key: 'artisan', label: 'Shana Portrait' },
                        { key: 'tulip', label: 'Tulip Crochet' },
                        { key: 'detail', label: 'Polaroid Art' },
                        { key: 'coasters', label: 'Resin Palette' },
                        { key: 'candle', label: 'Lavender Candle' },
                        { key: 'clock', label: 'Ocean Clock' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setFounderForm((prev) => ({ ...prev, img: item.key }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            founderForm.img === item.key
                              ? 'bg-[#59684c] text-white border-[#59684c]'
                              : 'bg-white text-[#59684c] border-[#eee7dc] hover:bg-[#f5efe6]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Badge Emoji Selector */}
                  <div className="pt-1">
                    <label className="text-xs font-bold block mb-1">
                      Avatar Badge Icon / Emoji
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['🌿', '🌸', '🌷', '✨', '🤍', '🎨', '🪡', '🕯️', '📸', '💎'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setFounderForm((prev) => ({ ...prev, badgeIcon: em }))}
                          className={`w-8 h-8 rounded-xl border text-sm flex items-center justify-center transition-transform hover:scale-110 ${
                            founderForm.badgeIcon === em
                              ? 'bg-[#e8eee3] border-[#59684c] shadow-xs'
                              : 'bg-white border-[#eee7dc]'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={founderForm.badgeIcon || ''}
                        onChange={(e) =>
                          setFounderForm((prev) => ({ ...prev, badgeIcon: e.target.value }))
                        }
                        placeholder="Custom emoji"
                        className="w-24 px-2 py-1 text-center rounded-xl border border-[#eee7dc] text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Founder Text, Role & Story */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-4">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a] flex items-center gap-2">
                <span className="material-icon text-lg text-[#59684c]">badge</span>
                <span>Founder Identity & Bio Text</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">
                    Section Eyebrow / Badge Text
                  </label>
                  <input
                    type="text"
                    value={founderForm.badge}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    placeholder="e.g. Meet the Maker & Studio"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a] font-semibold"
                  />
                  <small className="text-[10.5px] text-[#737c6e] mt-0.5 block">
                    Shown in the uppercase pill tag above the founder's name.
                  </small>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Founder / Maker Name</label>
                  <input
                    type="text"
                    value={founderForm.name}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Shana"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a] font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1">Role & Title</label>
                  <input
                    type="text"
                    value={founderForm.role}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder="e.g. Founder & Artisan"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                  <small className="text-[10.5px] text-[#737c6e] mt-0.5 block">
                    Displayed beside the name (e.g. {founderForm.name} · {founderForm.role}).
                  </small>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold">Founder Story & Personal Quote</label>
                    <span className="text-[11px] text-[#737c6e]">
                      {founderForm.bio.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={founderForm.bio}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Write a warm, authentic message about your craft philosophy, materials, and passion..."
                    className="w-full px-3 py-2 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a] leading-relaxed resize-y"
                  />
                  <small className="text-[10.5px] text-[#737c6e] mt-0.5 block">
                    This appears in quotes on the storefront. Keep it warm and personal to build customer trust.
                  </small>
                </div>
              </div>
            </div>

            {/* SECTION 3: WhatsApp & CTA Buttons */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-4">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a] flex items-center gap-2">
                <span className="material-icon text-lg text-[#59684c]">chat</span>
                <span>Direct WhatsApp Chat & Action Buttons</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">
                    Primary WhatsApp Button Label
                  </label>
                  <input
                    type="text"
                    value={founderForm.chatBtnText || ''}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, chatBtnText: e.target.value }))
                    }
                    placeholder={`Chat with ${founderForm.name}`}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">
                    Secondary Button Label
                  </label>
                  <input
                    type="text"
                    value={founderForm.secondaryBtnText || ''}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, secondaryBtnText: e.target.value }))
                    }
                    placeholder="Request Bespoke Idea"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1">
                    Pre-filled WhatsApp Message from Customers
                  </label>
                  <input
                    type="text"
                    value={founderForm.chatPrompt || ''}
                    onChange={(e) =>
                      setFounderForm((prev) => ({ ...prev, chatPrompt: e.target.value }))
                    }
                    placeholder={`Hi ${founderForm.name}! 🌿 I would love to discuss a custom handcrafted gift design.`}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                  <small className="text-[10.5px] text-[#737c6e] mt-0.5 block">
                    When a customer clicks the WhatsApp button on the Founder's card, this message opens ready to send.
                  </small>
                </div>
              </div>

              {/* Visibility Switch */}
              <div className="pt-2 border-t border-[#f5efe6] flex items-center justify-between">
                <div>
                  <b className="text-xs text-[#2b352a] block">
                    Homepage Visibility
                  </b>
                  <small className="text-[11px] text-[#737c6e]">
                    Show or temporarily hide the Founder's section from the storefront homepage.
                  </small>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFounderForm((prev) => ({
                        ...prev,
                        showSection: prev.showSection === false ? true : false,
                      }))
                    }
                    className={`toggle-switch ${founderForm.showSection !== false ? 'on' : ''}`}
                  />
                  <span className="text-xs font-semibold text-[#2b352a]">
                    {founderForm.showSection !== false ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFounderForm(founderSettings)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel Changes
              </button>
              <button
                type="button"
                onClick={async () => {
                  await updateFounderSettings(founderForm);
                }}
                className="btn-order text-xs py-2 px-6 shadow-sm"
              >
                <span className="material-icon text-sm">save</span>
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMER REVIEWS */}
        {currentTab === 'rev' && (
          <div className="space-y-4">
            <div>
              <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                Customer Reviews Manager
              </h1>
              <p className="text-xs text-[#737c6e]">
                Add, manage, and display customer testimonials and star ratings.
              </p>
            </div>

            {/* Add Review Card */}
            <div className="craft-card p-4 sm:p-5 bg-white border border-[#eee7dc] space-y-3">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                Add Customer Review
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Kochi, Kerala)"
                  value={reviewLoc}
                  onChange={(e) => setReviewLoc(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                />
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                </select>
              </div>

              <textarea
                rows={2}
                placeholder="Review text testimonial..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
              />

              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    if (!reviewName.trim() || !reviewText.trim()) {
                      showToast('Please enter customer name and review text');
                      return;
                    }
                    await addReview({
                      n: reviewName,
                      pl: reviewLoc || 'Verified Buyer',
                      r: reviewRating,
                      t: reviewText,
                    });
                    setReviewName('');
                    setReviewLoc('');
                    setReviewText('');
                  }}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Add Testimonial
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="craft-card p-4 bg-white border border-[#eee7dc] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <b className="text-xs font-bold text-[#2b352a]">{rev.n}</b>
                      <span className="text-[10px] text-[#59684c] font-bold">
                        {'★'.repeat(rev.r)}
                      </span>
                    </div>
                    <small className="text-[10.5px] text-[#737c6e] block mb-1.5">
                      📍 {rev.pl}
                    </small>
                    <p className="text-xs text-[#2b352a] italic leading-relaxed">
                      &ldquo;{rev.t}&rdquo;
                    </p>
                  </div>

                  <div className="flex justify-end pt-2 mt-2 border-t border-[#f5efe6]">
                    <button
                      onClick={() => deleteReview(idx)}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {currentTab === 'set' && (
          <div className="space-y-4">
            <div>
              <h1 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">
                Studio & Communication Settings
              </h1>
              <p className="text-xs text-[#737c6e]">
                Configure WhatsApp business line, Instagram handle, and delivery thresholds.
              </p>
            </div>

            {/* Store Logo Image Management */}
            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-3.5 max-w-lg mb-4">
              <h3 className="font-luxury-serif text-base font-bold text-[#2b352a]">
                Store Logo Image
              </h3>
              <p className="text-xs text-[#737c6e]">
                Upload or change the brand logo icon displayed in the header and sidebar.
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-[#eee7dc] bg-[#fcf9f4] flex items-center justify-center p-1 shrink-0">
                  <img
                    src={config.logo ? (IMAGES[config.logo] || config.logo) : IMAGES.logo}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                  />
                </div>

                <label className="btn-secondary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5">
                  <span className="material-icon text-base">cloud_upload</span>
                  <span>Upload Logo Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await uploadPhotoToCloud(file, 'branding');
                          await updateStoreLogo(url);
                        } catch (err: any) {
                          showToast('Logo upload failed');
                        }
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="craft-card p-5 bg-white border border-[#eee7dc] space-y-3.5 max-w-lg">
              <div>
                <label className="text-xs font-bold block mb-1">
                  WhatsApp Business Phone (without +)
                </label>
                <input
                  type="text"
                  value={settingsWa}
                  onChange={(e) => setSettingsWa(e.target.value)}
                  placeholder="e.g. 919999999999"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={settingsIgh}
                  onChange={(e) => setSettingsIgh(e.target.value)}
                  placeholder="e.g. shae_.made"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold block mb-1">Shipping Fee ₹</label>
                  <input
                    type="number"
                    value={settingsFee}
                    onChange={(e) => setSettingsFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Free Shipping Above ₹</label>
                  <input
                    type="number"
                    value={settingsFree}
                    onChange={(e) => setSettingsFree(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs text-[#2b352a]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() =>
                    updateStoreSettings(settingsWa, settingsFee, settingsFree, settingsIgh)
                  }
                  className="btn-order text-xs py-2 px-4 shadow-sm"
                >
                  Save Store Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. MOBILE FIXED BOTTOM TAB BAR (Visible only < 1024px) */}
      <nav
        aria-label="Admin quick tabs"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#2b352a]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-pb"
      >
        {[
          { tab: 'ov', icon: 'dashboard', label: 'Dashboard' },
          { tab: 'prod', icon: 'inventory_2', label: 'Products' },
          { tab: 'set', icon: 'settings', label: 'Settings' },
        ].map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => navigateTo(`admin/${item.tab}`)}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#59684c] text-white shadow-xs font-bold'
                  : 'text-[#e8eee3]/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-icon text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] tracking-wide mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* More Button: Opens Drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
            !['ov', 'prod', 'set'].includes(currentTab)
              ? 'bg-[#59684c] text-white shadow-xs font-bold'
              : 'text-[#e8eee3]/75 hover:bg-white/10 hover:text-white'
          }`}
          aria-label="More admin menu sections"
        >
          <span className="material-icon text-lg leading-none">
            {!['ov', 'prod', 'set'].includes(currentTab) ? currentMenuItem.icon : 'more_horiz'}
          </span>
          <span className="text-[10px] tracking-wide mt-1 leading-none">
            {!['ov', 'prod', 'set'].includes(currentTab) ? currentMenuItem.shortLabel : 'More'}
          </span>
        </button>
      </nav>
    </div>
  );
};
