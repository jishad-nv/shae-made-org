import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  Category,
  Review,
  StoryItem,
  HeroSettings,
  Inquiry,
  Order,
  BagItem,
  StoreConfig,
  DeliveryForm,
  CustomOrderOptions,
  DashboardMetrics,
  FounderSettings,
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_HERO,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS,
  INITIAL_STORIES,
  INITIAL_INQUIRIES,
  INITIAL_ORDERS,
  INITIAL_FOUNDER,
} from '../data/initialData';
import { IMAGES } from '../data/images';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  heroSettings: HeroSettings;
  reviews: Review[];
  stories: StoryItem[];
  inquiries: Inquiry[];
  orders: Order[];
  metrics: DashboardMetrics;
  bag: BagItem[];
  favorites: string[];
  config: StoreConfig;
  deliveryForm: DeliveryForm;
  setDeliveryForm: React.Dispatch<React.SetStateAction<DeliveryForm>>;
  customOptions: CustomOrderOptions;
  setCustomOptions: React.Dispatch<React.SetStateAction<CustomOrderOptions>>;
  unrecordedDraft: boolean;
  activeRoute: string;
  routeParam: string;
  navigateTo: (route: string) => void;
  toastMsg: string;
  showToast: (msg: string) => void;
  lightboxIndex: number;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;

  // Customer Order Modal
  orderModalData: { product: Product; qty: number; options?: Partial<CustomOrderOptions> } | null;
  openOrderModal: (product: Product, qty?: number, options?: Partial<CustomOrderOptions>) => void;
  closeOrderModal: () => void;

  // Actions
  getProductById: (id: string) => Product | undefined;
  getProductCover: (product: Product) => string;
  getProductGallery: (product: Product) => string[];
  addToBag: (id: string, options?: Partial<CustomOrderOptions>, qty?: number) => void;
  updateBagQty: (id: string, delta: number) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
  bagCount: number;
  bagSubtotal: number;
  shippingFee: number;
  bagTotal: number;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Orders Management
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  toggleOrderPaid: (orderId: string) => Promise<void>;
  updateOrderTracking: (orderId: string, trackingNumber: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Inquiries / Instagram Leads
  logInquiry: (name: string, item: string, total: number, loc?: string, phone?: string, refs?: string[]) => void;
  addInstagramLead: (lead: { name: string; handle: string; phone: string; item: string; total: number; memo: string }) => Promise<void>;
  updateInquiryStage: (id: string, newStage: number) => void;
  toggleInquiryPaid: (id: string) => void;
  updateInquiryMemo: (id: string, memo: string) => void;
  updateInquiryDue: (id: string, due: string) => void;
  deleteInquiry: (id: string) => void;
  addManualLead: (name: string, phone: string, item: string, total: number) => void;

  // Product Actions (up to 10 images)
  updateProductInline: (id: string, field: 'price' | 'mrp' | 'stock' | 'vis' | 'badge', value: any) => void;
  saveNewProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProductFull: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductPhotoCover: (id: string, photoIndex: number) => void;
  removeProductPhoto: (id: string, photoIndex: number) => void;
  addProductPhoto: (id: string, photoData: string) => void;

  // Category Actions
  addCategory: (name: string, icon: string) => Promise<boolean>;
  updateCategory: (index: number, name: string, icon: string) => Promise<void>;
  deleteCategory: (index: number) => Promise<void>;
  moveCategory: (index: number, direction: -1 | 1) => Promise<void>;

  // Showcase / Hero / Stories
  updateHeroSettings: (settings: Partial<HeroSettings>) => Promise<void>;
  updateTrendingSlotsCount: (count: number) => void;
  setTrendingSlot: (slotIndex: number, productId: string) => Promise<void>;
  resetHeroToDefault: () => void;
  addStoryPhoto: (img: string, cap?: string) => Promise<void>;
  deleteStoryItem: (index: number) => Promise<void>;

  // Reviews
  addReview: (review: Review) => Promise<void>;
  deleteReview: (index: number) => Promise<void>;

  // Founder Section
  founderSettings: FounderSettings;
  updateFounderSettings: (settings: Partial<FounderSettings>) => Promise<void>;
  resetFounderToDefault: () => void;

  // Settings
  updateStoreSettings: (wa?: string, fee?: number, free?: number, igh?: string) => Promise<void>;
  updateStoreLogo: (logoUrl: string) => void;
  publishChanges: () => Promise<void>;
  generateWhatsAppOrderMessage: (
    items: { name: string; q: number; price: number; note?: string; img?: string }[],
    total: number,
    form?: DeliveryForm,
    orderId?: string
  ) => string;
  openWhatsApp: (text: string, phone?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(`sm_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`sm_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Storage error for ${key}:`, e);
  }
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<StoreConfig>(() => loadFromStorage('cfg', INITIAL_CONFIG));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('p', INITIAL_PRODUCTS));
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(() => loadFromStorage('s', INITIAL_HERO));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('c', INITIAL_CATEGORIES));
  const [reviews, setReviews] = useState<Review[]>(() => loadFromStorage('rv', INITIAL_REVIEWS));
  const [stories, setStories] = useState<StoryItem[]>(() => loadFromStorage('ig', INITIAL_STORIES));
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => loadFromStorage('inq', INITIAL_INQUIRIES));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders', INITIAL_ORDERS));
  const [bag, setBag] = useState<BagItem[]>(() => loadFromStorage('bag', []));
  const [favorites, setFavorites] = useState<string[]>(() => loadFromStorage('fav', []));
  const [founderSettings, setFounderSettings] = useState<FounderSettings>(() => {
    const loaded = loadFromStorage<FounderSettings | null>('founder', null);
    if (loaded) return loaded;
    const cfg = loadFromStorage<StoreConfig | null>('cfg', null);
    if (cfg?.founder) return cfg.founder;
    return INITIAL_FOUNDER;
  });

  // Customer Order Modal
  const [orderModalData, setOrderModalData] = useState<{
    product: Product;
    qty: number;
    options?: Partial<CustomOrderOptions>;
  } | null>(null);

  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
    name: '',
    phone: '',
    loc: '',
    city: '',
    pincode: '',
    note: '',
  });

  const [customOptions, setCustomOptions] = useState<CustomOrderOptions>({
    q: 1,
    color: 'Pastel Pink',
    led: 'Warm White',
    msg: '',
  });

  const [unrecordedDraft, setUnrecordedDraft] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  // Router
  const [activeRoute, setActiveRoute] = useState<string>('');
  const [routeParam, setRouteParam] = useState<string>('');

  const parseHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/');
    setActiveRoute(parts[0] || '');
    setRouteParam(parts.slice(1).join('/'));
  };

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = `#/${route}`;
  };

  // Sync with Backend API on mount
  useEffect(() => {
    const fetchBackendState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          const localFounder = localStorage.getItem('sm_founder');
          const localConfig = localStorage.getItem('sm_cfg');
          const localHero = localStorage.getItem('sm_s');

          if (!localFounder && data.config?.founder) {
            setFounderSettings(data.config.founder);
            saveToStorage('founder', data.config.founder);
          }
          if (!localConfig && data.config) {
            setConfig(data.config);
            saveToStorage('cfg', data.config);
          }
          if (!localHero && data.heroSettings) {
            setHeroSettings(data.heroSettings);
            saveToStorage('s', data.heroSettings);
          }

          if (data.products && products.length === INITIAL_PRODUCTS.length) {
            setProducts(data.products);
            saveToStorage('p', data.products);
          }
          if (data.categories) {
            setCategories(data.categories);
            saveToStorage('c', data.categories);
          }
          if (data.reviews) {
            setReviews(data.reviews);
            saveToStorage('rv', data.reviews);
          }
          if (data.stories) {
            setStories(data.stories);
            saveToStorage('ig', data.stories);
          }
          if (data.inquiries) {
            setInquiries(data.inquiries);
            saveToStorage('inq', data.inquiries);
          }
          if (data.orders) {
            setOrders(data.orders);
            saveToStorage('orders', data.orders);
          }
        }
      } catch (err) {
        // Fallback to local storage
      }
    };
    fetchBackendState();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? '' : cur));
    }, 3200);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(-1);

  const openOrderModal = (product: Product, qty = 1, options?: Partial<CustomOrderOptions>) => {
    setOrderModalData({ product, qty, options });
  };

  const closeOrderModal = () => {
    setOrderModalData(null);
  };

  // Image helpers
  const getProductCover = (p: Product): string => {
    if (!p) return IMAGES.logo;
    return IMAGES[p.img] || p.img || IMAGES.logo;
  };

  const getProductGallery = (p: Product): string[] => {
    if (!p) return [IMAGES.logo];
    const raw = [p.img, ...(p.more || [])].filter(Boolean);
    return raw.map((src) => IMAGES[src] || src || IMAGES.logo);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  // Cart / Bag
  const addToBag = (id: string, options?: Partial<CustomOrderOptions>, qty = 1) => {
    const product = getProductById(id);
    if (!product) return;

    const notesParts: string[] = [];
    if (['Resin', 'Frames', 'Resin Crafts', 'Custom Frames'].includes(product.cat) && options?.color) {
      notesParts.push(`Colour: ${options.color}`);
    }
    if (['Frames', 'Custom Frames'].includes(product.cat) && options?.led) {
      notesParts.push(`Lights: ${options.led}`);
    }
    if (options?.msg?.trim()) {
      notesParts.push(`Text: ${options.msg.trim()}`);
    }
    const noteString = notesParts.join(', ');

    setBag((prev) => {
      const existing = prev.find((item) => item.id === id && item.note === noteString);
      let updated: BagItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.id === id && item.note === noteString ? { ...item, q: item.q + qty } : item
        );
      } else {
        updated = [...prev, { id, q: qty, note: noteString }];
      }
      saveToStorage('bag', updated);
      return updated;
    });

    showToast(`Added "${product.name}" to shopping bag!`);
  };

  const updateBagQty = (id: string, delta: number) => {
    setBag((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.q + delta;
            return nextQty > 0 ? { ...item, q: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as BagItem[];
      saveToStorage('bag', updated);
      return updated;
    });
  };

  const removeFromBag = (id: string) => {
    setBag((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage('bag', updated);
      return updated;
    });
    showToast('Item removed');
  };

  const clearBag = () => {
    setBag([]);
    saveToStorage('bag', []);
  };

  const bagCount = bag.reduce((sum, item) => sum + item.q, 0);

  const bagSubtotal = bag.reduce((sum, item) => {
    const product = getProductById(item.id);
    return sum + (product ? product.price * item.q : 0);
  }, 0);

  const shippingFee =
    bagSubtotal > 0 && bagSubtotal < config.ship.free ? config.ship.fee : 0;

  const bagTotal = bagSubtotal + shippingFee;

  // Favorites
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveToStorage('fav', next);
      showToast(next.includes(id) ? 'Saved to favorites' : 'Removed from favorites');
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  // ======================== ORDERS PIPELINE (BACKEND) ========================
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const created: Order = await res.json();
        setOrders((prev) => [created, ...prev]);
        saveToStorage('orders', [created, ...orders]);
        return created;
      }
    } catch (e) {
      console.error('API createOrder failed, falling back to local:', e);
    }

    // Fallback if backend offline
    const fallbackId = `SM-${Math.floor(1000 + Math.random() * 9000)}`;
    const fallbackOrder: Order = {
      ...orderData,
      id: fallbackId,
      createdAt: 'Just now',
    };
    const nextOrders = [fallbackOrder, ...orders];
    setOrders(nextOrders);
    saveToStorage('orders', nextOrders);
    return fallbackOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error(e);
    }

    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      saveToStorage('orders', next);
      return next;
    });
    showToast(`Order status updated to ${status}`);
  };

  const toggleOrderPaid = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const nextPaid = !order.paid;

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: nextPaid }),
      });
    } catch (e) {
      console.error(e);
    }

    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, paid: nextPaid } : o));
      saveToStorage('orders', next);
      return next;
    });
    showToast(nextPaid ? 'Marked as Paid' : 'Marked as Unpaid');
  };

  const updateOrderTracking = async (orderId: string, trackingNumber: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, status: 'Dispatched' }),
      });
    } catch (e) {
      console.error(e);
    }

    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId ? { ...o, trackingNumber, status: 'Dispatched' as Order['status'] } : o
      );
      saveToStorage('orders', next);
      return next;
    });
    showToast('Tracking number saved');
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }

    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      saveToStorage('orders', next);
      return next;
    });
    showToast('Order removed');
  };

  // ======================== INQUIRIES & INSTAGRAM LEADS ========================
  const logInquiry = (
    name: string,
    item: string,
    total: number,
    loc = '—',
    phone = '',
    refs: string[] = []
  ) => {
    const newInquiry: Inquiry = {
      id: String(Math.floor(1000 + Math.random() * 9000)),
      name: name.trim() || 'Website Visitor',
      loc: loc.trim() || '—',
      phone: phone.trim(),
      item,
      total,
      st: 0,
      time: 'Just now',
      memo: 'New inquiry from store',
      refs,
      paid: false,
      platform: 'Storefront',
    };

    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInquiry),
    }).catch(console.error);

    setInquiries((prev) => {
      const next = [newInquiry, ...prev];
      saveToStorage('inq', next);
      return next;
    });
  };

  const addInstagramLead = async (lead: {
    name: string;
    handle: string;
    phone: string;
    item: string;
    total: number;
    memo: string;
  }) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          loc: `Instagram (${lead.handle})`,
          item: lead.item,
          total: lead.total,
          memo: lead.memo,
          platform: 'Instagram',
          handle: lead.handle,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setInquiries((prev) => [created, ...prev]);
        saveToStorage('inq', [created, ...inquiries]);
        showToast('Instagram lead saved to CRM!');
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallback: Inquiry = {
      id: String(Math.floor(1000 + Math.random() * 9000)),
      name: lead.name,
      loc: `Instagram (${lead.handle})`,
      phone: lead.phone,
      item: lead.item,
      total: lead.total,
      st: 0,
      time: 'Just now',
      memo: lead.memo,
      platform: 'Instagram',
      handle: lead.handle,
      paid: false,
    };
    setInquiries((prev) => [fallback, ...prev]);
    saveToStorage('inq', [fallback, ...inquiries]);
    showToast('Instagram lead added!');
  };

  const updateInquiryStage = (id: string, newStage: number) => {
    fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ st: newStage }),
    }).catch(console.error);

    setInquiries((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, st: newStage } : i));
      saveToStorage('inq', next);
      return next;
    });
    showToast('Lead stage updated');
  };

  const toggleInquiryPaid = (id: string) => {
    setInquiries((prev) => {
      const inq = prev.find((i) => i.id === id);
      const nextPaid = inq ? !inq.paid : true;
      fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: nextPaid }),
      }).catch(console.error);

      const next = prev.map((i) => (i.id === id ? { ...i, paid: nextPaid } : i));
      saveToStorage('inq', next);
      return next;
    });
  };

  const updateInquiryMemo = (id: string, memo: string) => {
    fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo }),
    }).catch(console.error);

    setInquiries((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, memo } : i));
      saveToStorage('inq', next);
      return next;
    });
  };

  const updateInquiryDue = (id: string, due: string) => {
    fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ due }),
    }).catch(console.error);

    setInquiries((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, due } : i));
      saveToStorage('inq', next);
      return next;
    });
  };

  const deleteInquiry = (id: string) => {
    fetch(`/api/inquiries/${id}`, { method: 'DELETE' }).catch(console.error);
    setInquiries((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveToStorage('inq', next);
      return next;
    });
    showToast('Inquiry deleted');
  };

  const addManualLead = (name: string, phone: string, item: string, total: number) => {
    logInquiry(name, item, total, 'Manual Lead', phone);
    showToast('Lead saved');
  };

  // ======================== PRODUCT ACTIONS ========================
  const updateProductInline = (
    id: string,
    field: 'price' | 'mrp' | 'stock' | 'vis' | 'badge',
    value: any
  ) => {
    fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    }).catch(console.error);

    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, [field]: value } : p));
      saveToStorage('p', next);
      return next;
    });
  };

  const saveNewProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        const created: Product = await res.json();
        setProducts((prev) => [created, ...prev]);
        saveToStorage('p', [created, ...products]);
        showToast(`Craft "${created.name}" created!`);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const newProd: Product = {
      ...productData,
      id: `p${Date.now().toString().slice(-6)}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    saveToStorage('p', [newProd, ...products]);
    showToast(`Craft "${newProd.name}" created!`);
  };

  const updateProductFull = async (id: string, updated: Partial<Product>) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error(e);
    }

    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      saveToStorage('p', next);
      return next;
    });
    showToast('Craft updated');
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }

    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage('p', next);
      return next;
    });
    showToast('Craft removed');
  };

  const updateProductPhotoCover = (id: string, photoIndex: number) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const allPhotos = [p.img, ...(p.more || [])].filter(Boolean);
        if (photoIndex >= 0 && photoIndex < allPhotos.length) {
          const newCover = allPhotos[photoIndex];
          const newMore = allPhotos.filter((_, idx) => idx !== photoIndex);
          const updated = { ...p, img: newCover, more: newMore };
          fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ img: newCover, more: newMore }),
          }).catch(console.error);
          return updated;
        }
        return p;
      });
      saveToStorage('p', next);
      return next;
    });
    showToast('Cover photo updated');
  };

  const removeProductPhoto = (id: string, photoIndex: number) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const allPhotos = [p.img, ...(p.more || [])].filter(Boolean);
        if (photoIndex >= 0 && photoIndex < allPhotos.length) {
          const remaining = allPhotos.filter((_, idx) => idx !== photoIndex);
          const newCover = remaining[0] || 'coasters';
          const newMore = remaining.slice(1);
          const updated = { ...p, img: newCover, more: newMore };
          fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ img: newCover, more: newMore }),
          }).catch(console.error);
          return updated;
        }
        return p;
      });
      saveToStorage('p', next);
      return next;
    });
    showToast('Photo removed');
  };

  const addProductPhoto = (id: string, photoData: string) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const currentMore = p.more || [];
        if (currentMore.length >= 9) {
          showToast('Maximum 10 photos reached for this product');
          return p;
        }
        const newMore = [...currentMore, photoData];
        const updated = { ...p, more: newMore };
        fetch(`/api/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ more: newMore }),
        }).catch(console.error);
        return updated;
      });
      saveToStorage('p', next);
      return next;
    });
    showToast('Photo added to craft gallery (up to 10 photos supported)');
  };

  // ======================== CATEGORIES ========================
  const addCategory = async (name: string, icon: string): Promise<boolean> => {
    if (!name.trim()) return false;
    const clean = name.trim();
    if (categories.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      showToast('Category already exists');
      return false;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean, icon }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
        saveToStorage('c', [...categories, newCat]);
        showToast(`Category "${clean}" added`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }

    const newCat = { name: clean, icon };
    const next = [...categories, newCat];
    setCategories(next);
    saveToStorage('c', next);
    showToast(`Category "${clean}" added`);
    return true;
  };

  const updateCategory = async (index: number, name: string, icon: string) => {
    const next = [...categories];
    next[index] = { name: name.trim(), icon };
    setCategories(next);
    saveToStorage('c', next);
    fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(console.error);
    showToast('Category updated');
  };

  const deleteCategory = async (index: number) => {
    const cat = categories[index];
    if (!cat) return;
    const next = categories.filter((_, i) => i !== index);
    setCategories(next);
    saveToStorage('c', next);
    fetch(`/api/categories/${encodeURIComponent(cat.name)}`, { method: 'DELETE' }).catch(console.error);
    showToast('Category removed');
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setCategories(next);
    saveToStorage('c', next);
    fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(console.error);
  };

  // ======================== SHOWCASE & HERO ========================
  const updateHeroSettings = async (settings: Partial<HeroSettings>) => {
    const next = { ...heroSettings, ...settings };
    setHeroSettings(next);
    saveToStorage('s', next);
    fetch('/api/showcase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroSettings: next }),
    }).catch(console.error);
    showToast('Homepage hero updated');
  };

  const updateTrendingSlotsCount = (count: number) => {
    const nextSlots = [...heroSettings.slots];
    while (nextSlots.length < count) {
      const unused = products.find((p) => !nextSlots.includes(p.id));
      if (unused) nextSlots.push(unused.id);
      else break;
    }
    const trimmed = nextSlots.slice(0, count);
    const next = { ...heroSettings, slots: trimmed };
    setHeroSettings(next);
    saveToStorage('s', next);
    fetch('/api/showcase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: trimmed }),
    }).catch(console.error);
  };

  const setTrendingSlot = async (slotIndex: number, productId: string) => {
    const nextSlots = [...heroSettings.slots];
    nextSlots[slotIndex] = productId;
    const next = { ...heroSettings, slots: nextSlots };
    setHeroSettings(next);
    saveToStorage('s', next);
    fetch('/api/showcase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: nextSlots }),
    }).catch(console.error);
    showToast('Trending product showcase updated');
  };

  const resetHeroToDefault = () => {
    setHeroSettings(INITIAL_HERO);
    saveToStorage('s', INITIAL_HERO);
    fetch('/api/showcase', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroSettings: INITIAL_HERO }),
    }).catch(console.error);
    showToast('Reset hero to default');
  };

  const addStoryPhoto = async (img: string, cap = '') => {
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ img, cap }),
      });
      if (res.ok) {
        const created = await res.json();
        setStories((prev) => [created, ...prev]);
        saveToStorage('ig', [created, ...stories]);
        showToast('Story photo uploaded!');
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallback = { img, cap, url: `https://www.instagram.com/${config.igh}` };
    setStories((prev) => [fallback, ...prev]);
    saveToStorage('ig', [fallback, ...stories]);
    showToast('Story photo added');
  };

  const deleteStoryItem = async (index: number) => {
    fetch(`/api/stories/${index}`, { method: 'DELETE' }).catch(console.error);
    setStories((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveToStorage('ig', next);
      return next;
    });
    showToast('Story image removed');
  };

  // ======================== REVIEWS ========================
  const addReview = async (review: Review) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        const created = await res.json();
        setReviews((prev) => [created, ...prev]);
        saveToStorage('rv', [created, ...reviews]);
        showToast('Customer review added');
        return;
      }
    } catch (e) {
      console.error(e);
    }

    setReviews((prev) => [review, ...prev]);
    saveToStorage('rv', [review, ...reviews]);
    showToast('Customer review added');
  };

  const deleteReview = async (index: number) => {
    fetch(`/api/reviews/${index}`, { method: 'DELETE' }).catch(console.error);
    setReviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveToStorage('rv', next);
      return next;
    });
    showToast('Review deleted');
  };

  // ======================== SETTINGS & PUBLISHING ========================
  const updateStoreSettings = async (wa?: string, fee?: number, free?: number, igh?: string) => {
    const updated = {
      ...config,
      wa: wa !== undefined ? wa.trim() : config.wa,
      ship: {
        fee: fee !== undefined ? fee : config.ship.fee,
        free: free !== undefined ? free : config.ship.free,
      },
      igh: igh !== undefined ? igh.trim() : config.igh,
    };
    setConfig(updated);
    saveToStorage('cfg', updated);
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(console.error);
    showToast('Settings saved');
  };

  const updateStoreLogo = (logoUrl: string) => {
    const updated = { ...config, logo: logoUrl };
    setConfig(updated);
    saveToStorage('cfg', updated);
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(console.error);
    showToast('Store logo updated successfully');
  };

  const updateFounderSettings = async (settings: Partial<FounderSettings>) => {
    setFounderSettings((prev) => {
      const updated = { ...prev, ...settings };
      saveToStorage('founder', updated);
      setConfig((prevCfg) => {
        const updatedCfg = { ...prevCfg, founder: updated };
        saveToStorage('cfg', updatedCfg);
        fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCfg),
        }).catch(console.error);
        return updatedCfg;
      });
      return updated;
    });
    showToast("Founder's section updated successfully");
  };

  const resetFounderToDefault = () => {
    setFounderSettings(INITIAL_FOUNDER);
    saveToStorage('founder', INITIAL_FOUNDER);
    setConfig((prevCfg) => {
      const updatedCfg = { ...prevCfg, founder: INITIAL_FOUNDER };
      saveToStorage('cfg', updatedCfg);
      return updatedCfg;
    });
    showToast("Founder's section reset to default");
  };

  const publishChanges = async () => {
    setUnrecordedDraft(false);
    showToast('All changes are published live!');
  };

  // ======================== WHATSAPP ORDER GENERATOR ========================
  const generateWhatsAppOrderMessage = (
    items: { name: string; q: number; price: number; note?: string; img?: string }[],
    total: number,
    form?: DeliveryForm,
    orderId?: string
  ): string => {
    const refId = orderId || `SM-${Math.floor(1000 + Math.random() * 9000)}`;
    let msg = `🌿 *NEW ORDER - SHAE.MADE* 🌿\n`;
    msg += `Order Ref: *#${refId}*\n\n`;

    msg += `📦 *Items & Craft Details:*\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}* (x${item.q}) — ₹${(item.price * item.q).toLocaleString('en-IN')}\n`;
      if (item.note) {
        msg += `   └ Option: _${item.note}_\n`;
      }
      const rawImg = item.img ? (IMAGES[item.img] || item.img) : undefined;
      if (rawImg) {
        if (rawImg.startsWith('http')) {
          msg += `   └ 📸 Photo Link: ${rawImg}\n`;
        } else if (rawImg.startsWith('data:')) {
          msg += `   └ 📸 Photo: [Custom Photo Uploaded by Customer]\n`;
        }
      }
    });

    msg += `\n💰 *Total Amount:* ₹${total.toLocaleString('en-IN')} (All-India Delivery Included)\n\n`;

    if (form?.name) {
      msg += `👤 *Customer & Delivery Details:*\n`;
      msg += `• Name: *${form.name.trim()}*\n`;
      msg += `• Phone: ${form.phone.trim()}\n`;
      msg += `• Address: ${form.loc.trim()}`;
      if (form.city) msg += `, ${form.city.trim()}`;
      if (form.pincode) msg += ` - PIN: ${form.pincode.trim()}`;
      msg += `\n`;
    }

    if (form?.note?.trim()) {
      msg += `\n💌 *Gift Card / Crafting Note:*\n"${form.note.trim()}"\n`;
    }

    msg += `\n_Please confirm UPI payment details & crafting schedule. Thank you for supporting handmade craft!_ 🌸`;
    return msg;
  };

  const openWhatsApp = (text: string, phone?: string) => {
    const targetPhone = phone ? phone.replace(/[^0-9]/g, '') : config.wa.replace(/[^0-9]/g, '');
    const cleanPhone = targetPhone.startsWith('91') ? targetPhone : `91${targetPhone}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Live Metrics Calculation for Admin
  const confirmedOrders = orders.filter((o) => o.status !== 'Inquiry');
  const totalRev = confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const metrics: DashboardMetrics = {
    confirmedOrdersCount: confirmedOrders.length,
    totalRevenue: totalRev,
    averageOrderValue: confirmedOrders.length ? Math.round(totalRev / confirmedOrders.length) : 0,
    pendingInquiriesCount: inquiries.filter((i) => i.st === 0).length,
    craftingCount: orders.filter((o) => o.status === 'Crafting').length,
    dispatchedCount: orders.filter((o) => o.status === 'Dispatched').length,
    completedCount: orders.filter((o) => o.status === 'Completed').length,
    activeProductsCount: products.filter((p) => Boolean(p.vis)).length,
    outOfStockCount: products.filter((p) => !p.stock).length,
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        heroSettings,
        reviews,
        stories,
        inquiries,
        orders,
        metrics,
        bag,
        favorites,
        config,
        deliveryForm,
        setDeliveryForm,
        customOptions,
        setCustomOptions,
        unrecordedDraft,
        activeRoute,
        routeParam,
        navigateTo,
        toastMsg,
        showToast,
        lightboxIndex,
        openLightbox,
        closeLightbox,
        orderModalData,
        openOrderModal,
        closeOrderModal,
        getProductById,
        getProductCover,
        getProductGallery,
        addToBag,
        updateBagQty,
        removeFromBag,
        clearBag,
        bagCount,
        bagSubtotal,
        shippingFee,
        bagTotal,
        toggleFavorite,
        isFavorite,
        createOrder,
        updateOrderStatus,
        toggleOrderPaid,
        updateOrderTracking,
        deleteOrder,
        logInquiry,
        addInstagramLead,
        updateInquiryStage,
        toggleInquiryPaid,
        updateInquiryMemo,
        updateInquiryDue,
        deleteInquiry,
        addManualLead,
        updateProductInline,
        saveNewProduct,
        updateProductFull,
        deleteProduct,
        updateProductPhotoCover,
        removeProductPhoto,
        addProductPhoto,
        addCategory,
        updateCategory,
        deleteCategory,
        moveCategory,
        updateHeroSettings,
        updateTrendingSlotsCount,
        setTrendingSlot,
        resetHeroToDefault,
        addStoryPhoto,
        deleteStoryItem,
        addReview,
        deleteReview,
        founderSettings,
        updateFounderSettings,
        resetFounderToDefault,
        updateStoreSettings,
        updateStoreLogo,
        publishChanges,
        generateWhatsAppOrderMessage,
        openWhatsApp,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
