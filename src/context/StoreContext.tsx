import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { isBase64DataUrl, uploadImageToStorage } from '../utils/imageUpload';
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

export interface MigrationStatus {
  running: boolean;
  progress: number;
  message: string;
  complete: boolean;
  error: string | null;
}

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

  // Cloud Loading & Error state
  isLoading: boolean;
  loadError: string | null;
  retryLoading: () => void;
  lastSyncTime: string | null;
  lastSyncError: string | null;
  isCloudConnected: boolean;

  // Migration from local storage to Firebase cloud
  uploadLocalDataToCloud: () => Promise<void>;
  migrationStatus: MigrationStatus;

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
  lookupOrder: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  toggleOrderPaid: (orderId: string) => Promise<void>;
  updateOrderTracking: (orderId: string, trackingNumber: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Inquiries / Instagram Leads
  logInquiry: (name: string, item: string, total: number, loc?: string, phone?: string, refs?: string[]) => Promise<void>;
  addInstagramLead: (lead: { name: string; handle: string; phone: string; item: string; total: number; memo: string }) => Promise<void>;
  updateInquiryStage: (id: string, newStage: number) => Promise<void>;
  toggleInquiryPaid: (id: string) => Promise<void>;
  updateInquiryMemo: (id: string, memo: string) => Promise<void>;
  updateInquiryDue: (id: string, due: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  addManualLead: (name: string, phone: string, item: string, total: number) => Promise<void>;

  // Product Actions
  updateProductInline: (id: string, field: 'price' | 'mrp' | 'stock' | 'vis' | 'badge', value: any) => Promise<void>;
  saveNewProduct: (product: Omit<Product, 'id'>, customId?: string) => Promise<void>;
  updateProductFull: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  removeDuplicateProducts: () => Promise<{ removedCount: number }>;
  updateProductPhotoCover: (id: string, photoIndex: number) => Promise<void>;
  removeProductPhoto: (id: string, photoIndex: number) => Promise<void>;
  addProductPhoto: (id: string, photoData: string) => Promise<void>;

  // Category Actions
  addCategory: (name: string, icon: string) => Promise<boolean>;
  updateCategory: (index: number, name: string, icon: string) => Promise<void>;
  deleteCategory: (index: number) => Promise<void>;
  moveCategory: (index: number, direction: -1 | 1) => Promise<void>;

  // Showcase / Hero / Stories
  updateHeroSettings: (settings: Partial<HeroSettings>) => Promise<void>;
  updateTrendingSlotsCount: (count: number) => Promise<void>;
  setTrendingSlot: (slotIndex: number, productId: string) => Promise<void>;
  resetHeroToDefault: () => Promise<void>;
  addStoryPhoto: (img: string, cap?: string) => Promise<void>;
  deleteStoryItem: (storyIdOrIndex: string | number) => Promise<void>;

  // Reviews
  addReview: (review: Review) => Promise<void>;
  deleteReview: (reviewIdOrIndex: string | number) => Promise<void>;

  // Founder Section
  founderSettings: FounderSettings;
  updateFounderSettings: (settings: Partial<FounderSettings>) => Promise<void>;
  resetFounderToDefault: () => Promise<void>;

  // Settings
  updateStoreSettings: (wa?: string, fee?: number, free?: number, igh?: string) => Promise<void>;
  updateStoreLogo: (logoUrl: string) => Promise<void>;
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

// Cart is explicitly kept local per visitor
const loadLocalBag = (): BagItem[] => {
  try {
    const saved = localStorage.getItem('sm_bag');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalBag = (bag: BagItem[]) => {
  try {
    localStorage.setItem('sm_bag', JSON.stringify(bag));
  } catch (e) {
    console.error('Error saving bag:', e);
  }
};

const loadLocalFav = (): string[] => {
  try {
    const saved = localStorage.getItem('sm_fav');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Live Cloud States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(INITIAL_HERO);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<StoreConfig>(INITIAL_CONFIG);
  const [founderSettings, setFounderSettings] = useState<FounderSettings>(INITIAL_FOUNDER);

  // Local-only visitor states (Cart and Favorites)
  const [bag, setBag] = useState<BagItem[]>(loadLocalBag);
  const [favorites, setFavorites] = useState<string[]>(loadLocalFav);

  // Status & Loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // Migration status
  const isInitiallyMigrated = typeof window !== 'undefined' && localStorage.getItem('sm_cloud_migrated_done') === 'true';
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    running: false,
    progress: isInitiallyMigrated ? 100 : 0,
    message: isInitiallyMigrated ? 'Local data already migrated to Firestore' : '',
    complete: isInitiallyMigrated,
    error: null,
  });

  // Modal & Navigation States
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
  const closeOrderModal = () => setOrderModalData(null);

  // Admin auth assertion
  const requireAdmin = (): boolean => {
    if (!auth.currentUser) {
      const msg = 'Please log in again (Admin unauthenticated or session expired)';
      showToast(msg);
      setLastSyncError('auth/unauthenticated: Please log in again');
      navigateTo('admin');
      return false;
    }
    return true;
  };

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // ======================== REALTIME FIRESTORE LISTENERS ========================
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    let loadedCount = 0;
    const totalRequired = 4; // products, categories, site, hero

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalRequired) {
        setIsLoading(false);
      }
    };

    const unsubs: (() => void)[] = [];

    // 1. PRODUCTS Listener
    try {
      const unsubProducts = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          setIsCloudConnected(true);
          setLastSyncError(null);
          const list: Product[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Product);
          });
          if (list.length > 0) {
            setProducts(list);
          } else {
            // Firestore has no products yet -> fallback to INITIAL_PRODUCTS
            setProducts(INITIAL_PRODUCTS);
            // If admin is logged in, auto-seed to Firestore immediately
            if (auth.currentUser) {
              const seedBatch = async () => {
                try {
                  for (const p of INITIAL_PRODUCTS) {
                    await setDoc(doc(db, 'products', p.id), p);
                  }
                  setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                } catch (e) {
                  console.warn('Auto-seed products note:', e);
                }
              };
              seedBatch();
            }
          }
          checkComplete();
        },
        (error) => {
          console.error('Error listening to products:', error);
          const code = (error as any)?.code || 'error';
          setLoadError(`Failed to load live products [${code}]: ${error.message}`);
          setIsCloudConnected(false);
          setIsLoading(false);
          setProducts(INITIAL_PRODUCTS);
        }
      );
      unsubs.push(unsubProducts);
    } catch (err) {
      console.error(err);
    }

    // 2. CATEGORIES Listener
    try {
      const unsubCat = onSnapshot(
        doc(db, 'settings', 'categories'),
        (snapshot) => {
          if (snapshot.exists() && Array.isArray(snapshot.data().items)) {
            setCategories(snapshot.data().items);
          } else {
            setCategories(INITIAL_CATEGORIES);
          }
          checkComplete();
        },
        (error) => {
          console.warn('Categories listener error:', error);
          checkComplete();
        }
      );
      unsubs.push(unsubCat);
    } catch (err) {
      console.error(err);
    }

    // 3. SITE SETTINGS Listener
    try {
      const unsubSite = onSnapshot(
        doc(db, 'settings', 'site'),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setConfig((prev) => ({
              ...prev,
              ...data,
              ship: data.ship || prev.ship,
            }));
            if (data.founder) {
              setFounderSettings(data.founder);
            }
          }
          checkComplete();
        },
        (error) => {
          console.warn('Site settings listener error:', error);
          checkComplete();
        }
      );
      unsubs.push(unsubSite);
    } catch (err) {
      console.error(err);
    }

    // 4. HERO SETTINGS Listener
    try {
      const unsubHero = onSnapshot(
        doc(db, 'settings', 'hero'),
        (snapshot) => {
          if (snapshot.exists()) {
            setHeroSettings(snapshot.data() as HeroSettings);
          }
          checkComplete();
        },
        (error) => {
          console.warn('Hero settings listener error:', error);
          checkComplete();
        }
      );
      unsubs.push(unsubHero);
    } catch (err) {
      console.error(err);
    }

    // 5. REVIEWS Listener
    try {
      const unsubRev = onSnapshot(
        collection(db, 'reviews'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Review[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as Review);
            });
            setReviews(list);
          } else {
            setReviews(INITIAL_REVIEWS);
          }
        },
        (error) => {
          console.warn('Reviews listener error:', error);
        }
      );
      unsubs.push(unsubRev);
    } catch (err) {
      console.error(err);
    }

    // 6. STORIES Listener
    try {
      const unsubStories = onSnapshot(
        collection(db, 'stories'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: StoryItem[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as StoryItem);
            });
            setStories(list);
          } else {
            setStories(INITIAL_STORIES);
          }
        },
        (error) => {
          console.warn('Stories listener error:', error);
        }
      );
      unsubs.push(unsubStories);
    } catch (err) {
      console.error(err);
    }

    // 7. ORDERS & INQUIRIES Listeners (for signed-in admin)
    if (currentUser) {
      try {
        const unsubOrders = onSnapshot(
          collection(db, 'orders'),
          (snapshot) => {
            const list: Order[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as Order);
            });
            setOrders(list);
          },
          (error) => {
            console.warn('Orders listener error (admin):', error);
          }
        );
        unsubs.push(unsubOrders);

        const unsubInq = onSnapshot(
          collection(db, 'inquiries'),
          (snapshot) => {
            const list: Inquiry[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as Inquiry);
            });
            setInquiries(list);
          },
          (error) => {
            console.warn('Inquiries listener error (admin):', error);
          }
        );
        unsubs.push(unsubInq);
      } catch (err) {
        console.error(err);
      }
    }

    // Safety timeout to avoid hanging indefinitely if offline
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
      unsubs.forEach((u) => u());
    };
  }, [retryTrigger, currentUser]);

  const retryLoading = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  // ======================== BAG (CART) & FAVORITES ========================
  const addToBag = (id: string, options?: Partial<CustomOrderOptions>, qty = 1) => {
    setBag((prev) => {
      const existing = prev.find((item) => item.id === id);
      let next: BagItem[];
      if (existing) {
        next = prev.map((item) =>
          item.id === id ? { ...item, q: item.q + qty } : item
        );
      } else {
        const note = options?.color ? `Color: ${options.color}` : '';
        next = [...prev, { id, q: qty, note }];
      }
      saveLocalBag(next);
      return next;
    });
    showToast('Added to bag');
  };

  const updateBagQty = (id: string, delta: number) => {
    setBag((prev) => {
      const next = prev
        .map((item) => {
          if (item.id === id) {
            const q = item.q + delta;
            return q > 0 ? { ...item, q } : null;
          }
          return item;
        })
        .filter((item): item is BagItem => item !== null);
      saveLocalBag(next);
      return next;
    });
  };

  const removeFromBag = (id: string) => {
    setBag((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveLocalBag(next);
      return next;
    });
    showToast('Item removed from bag');
  };

  const clearBag = () => {
    setBag([]);
    saveLocalBag([]);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try {
        localStorage.setItem('sm_fav', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  // Cart computed
  const bagCount = bag.reduce((sum, item) => sum + item.q, 0);
  const bagSubtotal = bag.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.id);
    return sum + (prod ? prod.price * item.q : 0);
  }, 0);
  const shippingFee =
    bagSubtotal === 0 || bagSubtotal >= config.ship.free ? 0 : config.ship.fee;
  const bagTotal = bagSubtotal + shippingFee;

  // Product Helpers
  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getProductCover = (product: Product): string => {
    if (product.img && (product.img.startsWith('http') || product.img.startsWith('/'))) {
      return product.img;
    }
    return IMAGES[product.img] || product.img || IMAGES.coasters;
  };

  const getProductGallery = (product: Product): string[] => {
    const cover = getProductCover(product);
    const gallery = (product.more || []).map((src) => {
      if (src.startsWith('http') || src.startsWith('/')) return src;
      return IMAGES[src] || src;
    });
    return [cover, ...gallery.filter((s) => s !== cover)];
  };

  // ======================== ORDERS ========================
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const orderId = `SM-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      console.error('Error saving order to Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
    }

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order #${orderId} confirmed!`);
    return newOrder;
  };

  const lookupOrder = async (orderId: string): Promise<Order | null> => {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId.trim()));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Order;
      }
      return null;
    } catch (err) {
      console.error('Lookup order error:', err);
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      showToast(`Order status updated to ${status}`);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const toggleOrderPaid = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const nextPaid = !order.paid;
    try {
      await updateDoc(doc(db, 'orders', orderId), { paid: nextPaid });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paid: nextPaid } : o))
      );
      showToast(nextPaid ? 'Marked as Paid' : 'Marked as Unpaid');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const updateOrderTracking = async (orderId: string, trackingNumber: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { trackingNumber });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, trackingNumber } : o))
      );
      showToast('Tracking number updated');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Order removed');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  // ======================== INQUIRIES & LEADS ========================
  const logInquiry = async (
    name: string,
    item: string,
    total: number,
    loc = '—',
    phone = '',
    refs: string[] = []
  ) => {
    const id = String(Math.floor(1000 + Math.random() * 9000));
    const newInquiry: Inquiry = {
      id,
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

    try {
      await setDoc(doc(db, 'inquiries', id), newInquiry);
    } catch (err) {
      console.error('Error saving inquiry:', err);
    }
    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const addInstagramLead = async (lead: {
    name: string;
    handle: string;
    phone: string;
    item: string;
    total: number;
    memo: string;
  }) => {
    const id = String(Math.floor(1000 + Math.random() * 9000));
    const newInq: Inquiry = {
      id,
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

    try {
      await setDoc(doc(db, 'inquiries', id), newInq);
      setInquiries((prev) => [newInq, ...prev]);
      showToast('Instagram lead saved to cloud!');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${id}`);
    }
  };

  const updateInquiryStage = async (id: string, newStage: number) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { st: newStage });
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, st: newStage } : i)));
      showToast('Lead stage updated');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const toggleInquiryPaid = async (id: string) => {
    const inq = inquiries.find((i) => i.id === id);
    const nextPaid = inq ? !inq.paid : true;
    try {
      await updateDoc(doc(db, 'inquiries', id), { paid: nextPaid });
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, paid: nextPaid } : i)));
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const updateInquiryMemo = async (id: string, memo: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { memo });
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, memo } : i)));
    } catch (err) {
      console.error(err);
    }
  };

  const updateInquiryDue = async (id: string, due: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { due });
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, due } : i)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      showToast('Inquiry removed');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
    }
  };

  const addManualLead = async (name: string, phone: string, item: string, total: number) => {
    await logInquiry(name, item, total, 'Manual Lead', phone);
    showToast('Lead saved');
  };

  // ======================== PRODUCT ACTIONS ========================
  const updateProductInline = async (
    id: string,
    field: 'price' | 'mrp' | 'stock' | 'vis' | 'badge',
    value: any
  ) => {
    try {
      await updateDoc(doc(db, 'products', id), { [field]: value });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    } catch (err) {
      console.error('Update product inline error:', err);
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  const saveNewProduct = async (productData: Omit<Product, 'id'>, customId?: string) => {
    if (!requireAdmin()) return;
    const cleanSlug = productData.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 24);
    const id =
      customId ||
      (productData as any).draftId ||
      `p_${cleanSlug || 'craft'}_${Date.now().toString(36)}`;

    const cleanProductData = { ...productData };
    delete (cleanProductData as any).draftId;

    const newProd: Product = {
      ...cleanProductData,
      id,
    };

    try {
      await setDoc(doc(db, 'products', id), newProd, { merge: true });
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newProd;
          return updated;
        }
        return [newProd, ...prev];
      });
      showToast(`Craft "${newProd.name}" saved to cloud!`);
    } catch (err) {
      console.error('Error saving new product to cloud:', err);
      handleFirestoreError(err, OperationType.CREATE, `products/${id}`);
      throw err;
    }
  };

  const updateProductFull = async (id: string, updated: Partial<Product>) => {
    try {
      await setDoc(doc(db, 'products', id), updated, { merge: true });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      showToast('Craft updated in cloud');
    } catch (err) {
      console.error('Error updating product:', err);
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Craft deleted from cloud');
    } catch (err) {
      console.error('Error deleting product:', err);
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const removeDuplicateProducts = async (): Promise<{ removedCount: number }> => {
    if (!requireAdmin()) return { removedCount: 0 };
    const seen = new Map<string, Product>();
    const duplicatesToDelete: Product[] = [];

    for (const p of products) {
      const key = `${p.name.trim().toLowerCase()}__${p.price}__${(p.img || '').trim().slice(0, 80)}`;
      if (seen.has(key)) {
        duplicatesToDelete.push(p);
      } else {
        seen.set(key, p);
      }
    }

    if (duplicatesToDelete.length === 0) {
      showToast('No duplicate products found. Catalog is clean!');
      return { removedCount: 0 };
    }

    try {
      for (const dup of duplicatesToDelete) {
        await deleteDoc(doc(db, 'products', dup.id));
      }
      setProducts((prev) => {
        const deletedIds = new Set(duplicatesToDelete.map((d) => d.id));
        return prev.filter((p) => !deletedIds.has(p.id));
      });
      showToast(`Removed ${duplicatesToDelete.length} duplicate product(s) from cloud!`);
      return { removedCount: duplicatesToDelete.length };
    } catch (err: any) {
      console.error('Error removing duplicates:', err);
      handleFirestoreError(err, OperationType.DELETE, 'products/duplicates');
      throw err;
    }
  };

  const updateProductPhotoCover = async (id: string, photoIndex: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const all = [product.img, ...(product.more || [])].filter(Boolean);
    if (photoIndex < 0 || photoIndex >= all.length) return;
    const selected = all[photoIndex];
    const newMore = all.filter((_, idx) => idx !== photoIndex);
    await updateProductFull(id, { img: selected, more: newMore });
    showToast('Cover photo updated');
  };

  const removeProductPhoto = async (id: string, photoIndex: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const all = [product.img, ...(product.more || [])].filter(Boolean);
    const filtered = all.filter((_, idx) => idx !== photoIndex);
    const newImg = filtered[0] || 'coasters';
    const newMore = filtered.slice(1);
    await updateProductFull(id, { img: newImg, more: newMore });
    showToast('Photo removed');
  };

  const addProductPhoto = async (id: string, photoData: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const existingMore = product.more || [];
    if (!product.img || product.img === 'coasters') {
      await updateProductFull(id, { img: photoData });
    } else {
      await updateProductFull(id, { more: [...existingMore, photoData].slice(0, 9) });
    }
    showToast('Photo added');
  };

  // ======================== CATEGORY ACTIONS ========================
  const addCategory = async (name: string, icon: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Category already exists');
      return false;
    }
    const nextCategories = [...categories, { name: trimmed, icon: icon.trim() || 'palette' }];
    try {
      await setDoc(doc(db, 'settings', 'categories'), { items: nextCategories });
      setCategories(nextCategories);
      showToast(`Category "${trimmed}" added!`);
      return true;
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/categories');
    }
  };

  const updateCategory = async (index: number, name: string, icon: string) => {
    const nextCategories = [...categories];
    if (!nextCategories[index]) return;
    nextCategories[index] = { name: name.trim(), icon: icon.trim() || 'palette' };
    try {
      await setDoc(doc(db, 'settings', 'categories'), { items: nextCategories });
      setCategories(nextCategories);
      showToast('Category updated');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/categories');
    }
  };

  const deleteCategory = async (index: number) => {
    const nextCategories = categories.filter((_, i) => i !== index);
    try {
      await setDoc(doc(db, 'settings', 'categories'), { items: nextCategories });
      setCategories(nextCategories);
      showToast('Category deleted');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/categories');
    }
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const nextCategories = [...categories];
    const temp = nextCategories[index];
    nextCategories[index] = nextCategories[target];
    nextCategories[target] = temp;
    try {
      await setDoc(doc(db, 'settings', 'categories'), { items: nextCategories });
      setCategories(nextCategories);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/categories');
    }
  };

  // ======================== SHOWCASE / HERO / STORIES ========================
  const updateHeroSettings = async (settings: Partial<HeroSettings>) => {
    const next = { ...heroSettings, ...settings };
    try {
      await setDoc(doc(db, 'settings', 'hero'), next, { merge: true });
      setHeroSettings(next);
      showToast('Hero settings saved to cloud');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/hero');
    }
  };

  const updateTrendingSlotsCount = async (count: number) => {
    const curSlots = [...(heroSettings.slots || [])];
    const nextSlots = curSlots.slice(0, count);
    while (nextSlots.length < count) {
      const unused = products.find((p) => !nextSlots.includes(p.id));
      if (unused) nextSlots.push(unused.id);
      else if (products[0]) nextSlots.push(products[0].id);
      else break;
    }
    await updateHeroSettings({ slots: nextSlots });
  };

  const setTrendingSlot = async (slotIndex: number, productId: string) => {
    const nextSlots = [...(heroSettings.slots || [])];
    nextSlots[slotIndex] = productId;
    await updateHeroSettings({ slots: nextSlots });
    showToast('Trending craft slot updated');
  };

  const resetHeroToDefault = async () => {
    await updateHeroSettings(INITIAL_HERO);
    showToast('Hero reset to default');
  };

  const addStoryPhoto = async (img: string, cap?: string) => {
    const id = `s_${Date.now()}`;
    const newStory: StoryItem = { img, cap: cap || '' };
    try {
      await setDoc(doc(db, 'stories', id), newStory);
      setStories((prev) => [newStory, ...prev]);
      showToast('Story added to cloud showcase!');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, `stories/${id}`);
    }
  };

  const deleteStoryItem = async (storyIdOrIndex: string | number) => {
    if (typeof storyIdOrIndex === 'number') {
      const target = stories[storyIdOrIndex];
      if (!target) return;
      const nextStories = stories.filter((_, i) => i !== storyIdOrIndex);
      setStories(nextStories);
      try {
        const snap = await getDocs(collection(db, 'stories'));
        let idx = 0;
        snap.forEach((d) => {
          if (idx === storyIdOrIndex) {
            deleteDoc(d.ref);
          }
          idx++;
        });
        showToast('Story removed');
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await deleteDoc(doc(db, 'stories', storyIdOrIndex));
        showToast('Story removed');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ======================== REVIEWS ========================
  const addReview = async (review: Review) => {
    const id = `rev_${Date.now()}`;
    try {
      await setDoc(doc(db, 'reviews', id), review);
      setReviews((prev) => [review, ...prev]);
      showToast('Customer review saved to cloud!');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, `reviews/${id}`);
    }
  };

  const deleteReview = async (reviewIdOrIndex: string | number) => {
    if (typeof reviewIdOrIndex === 'number') {
      const nextReviews = reviews.filter((_, i) => i !== reviewIdOrIndex);
      setReviews(nextReviews);
      try {
        const snap = await getDocs(collection(db, 'reviews'));
        let idx = 0;
        snap.forEach((d) => {
          if (idx === reviewIdOrIndex) {
            deleteDoc(d.ref);
          }
          idx++;
        });
        showToast('Review removed');
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await deleteDoc(doc(db, 'reviews', reviewIdOrIndex));
        showToast('Review removed');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ======================== FOUNDER & SETTINGS ========================
  const updateFounderSettings = async (settings: Partial<FounderSettings>) => {
    const next = { ...founderSettings, ...settings };
    try {
      await setDoc(doc(db, 'settings', 'site'), { founder: next }, { merge: true });
      setFounderSettings(next);
      showToast('Founder profile saved to cloud');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/site');
    }
  };

  const resetFounderToDefault = async () => {
    await updateFounderSettings(INITIAL_FOUNDER);
    showToast('Founder settings reset to default');
  };

  const updateStoreSettings = async (wa?: string, fee?: number, free?: number, igh?: string) => {
    const updates: any = {};
    if (wa !== undefined) updates.wa = wa.trim();
    if (igh !== undefined) updates.igh = igh.trim();
    if (fee !== undefined || free !== undefined) {
      updates.ship = {
        fee: fee !== undefined ? fee : config.ship.fee,
        free: free !== undefined ? free : config.ship.free,
      };
    }

    try {
      await setDoc(doc(db, 'settings', 'site'), updates, { merge: true });
      setConfig((prev) => ({
        ...prev,
        ...updates,
        ship: updates.ship || prev.ship,
      }));
      showToast('Store settings saved to cloud!');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/site');
    }
  };

  const updateStoreLogo = async (logoUrl: string) => {
    try {
      await setDoc(doc(db, 'settings', 'site'), { logo: logoUrl }, { merge: true });
      setConfig((prev) => ({ ...prev, logo: logoUrl }));
      showToast('Store logo updated');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/site');
    }
  };

  const publishChanges = async () => {
    showToast('All changes are already saved live to Firebase Cloud!');
  };

  // ======================== ONE-TIME CLOUD MIGRATION ========================
  const uploadLocalDataToCloud = async () => {
    setMigrationStatus({
      running: true,
      progress: 5,
      message: 'Reading local browser data...',
      complete: false,
      error: null,
    });

    try {
      // 1. Read localStorage
      const localProductsRaw = localStorage.getItem('sm_p');
      const localCategoriesRaw = localStorage.getItem('sm_c');
      const localHeroRaw = localStorage.getItem('sm_s');
      const localConfigRaw = localStorage.getItem('sm_cfg');
      const localReviewsRaw = localStorage.getItem('sm_rv');
      const localStoriesRaw = localStorage.getItem('sm_ig');
      const localOrdersRaw = localStorage.getItem('sm_orders');
      const localInquiriesRaw = localStorage.getItem('sm_inq');
      const localFounderRaw = localStorage.getItem('sm_founder');

      let rawSourceProducts: Product[] = localProductsRaw
        ? JSON.parse(localProductsRaw)
        : (products.length > 0 ? products : INITIAL_PRODUCTS);

      // Make migration idempotent: deduplicate products by name, price, and cover image
      const dedupMap = new Map<string, Product>();
      for (const p of rawSourceProducts) {
        const key = `${p.name.trim().toLowerCase()}__${p.price}__${(p.img || '').trim().slice(0, 80)}`;
        if (!dedupMap.has(key)) {
          dedupMap.set(key, p);
        }
      }
      const sourceProducts: Product[] = Array.from(dedupMap.values());
      let sourceCategories: Category[] = localCategoriesRaw
        ? JSON.parse(localCategoriesRaw)
        : (categories.length > 0 ? categories : INITIAL_CATEGORIES);
      let sourceHero: HeroSettings = localHeroRaw
        ? JSON.parse(localHeroRaw)
        : heroSettings;
      let sourceConfig: StoreConfig = localConfigRaw
        ? JSON.parse(localConfigRaw)
        : config;
      let sourceFounder: FounderSettings = localFounderRaw
        ? JSON.parse(localFounderRaw)
        : founderSettings;
      let sourceReviews: Review[] = localReviewsRaw
        ? JSON.parse(localReviewsRaw)
        : reviews;
      let sourceStories: StoryItem[] = localStoriesRaw
        ? JSON.parse(localStoriesRaw)
        : stories;
      let sourceOrders: Order[] = localOrdersRaw
        ? JSON.parse(localOrdersRaw)
        : orders;
      let sourceInquiries: Inquiry[] = localInquiriesRaw
        ? JSON.parse(localInquiriesRaw)
        : inquiries;

      setMigrationStatus((s) => ({
        ...s,
        progress: 20,
        message: 'Uploading and compressing local craft photos to Firebase Storage...',
      }));

      // 2. Process and upload base64 images in products to Storage
      const migratedProducts: Product[] = [];
      let photoIdx = 0;
      for (const p of sourceProducts) {
        let cleanImg = p.img;
        if (isBase64DataUrl(cleanImg)) {
          try {
            setMigrationStatus((s) => ({
              ...s,
              message: `Uploading photo for "${p.name}" to Firebase Storage...`,
            }));
            cleanImg = await uploadImageToStorage(cleanImg, 'products', `prod_${p.id}_cover.jpg`);
          } catch (e) {
            console.warn('Storage upload error for product cover:', e);
          }
        }

        const cleanMore: string[] = [];
        if (Array.isArray(p.more)) {
          for (let mIdx = 0; mIdx < p.more.length; mIdx++) {
            let mSrc = p.more[mIdx];
            if (isBase64DataUrl(mSrc)) {
              try {
                mSrc = await uploadImageToStorage(mSrc, 'products', `prod_${p.id}_gal_${mIdx}.jpg`);
              } catch (e) {
                console.warn('Storage upload error for gallery:', e);
              }
            }
            cleanMore.push(mSrc);
          }
        }

        migratedProducts.push({
          ...p,
          img: cleanImg,
          more: cleanMore,
        });
        photoIdx++;
      }

      setMigrationStatus((s) => ({
        ...s,
        progress: 50,
        message: 'Saving products to Firestore...',
      }));

      // 3. Save products to Firestore
      for (const p of migratedProducts) {
        await setDoc(doc(db, 'products', p.id), p);
      }

      setMigrationStatus((s) => ({
        ...s,
        progress: 70,
        message: 'Saving site configuration, categories, and hero...',
      }));

      // 4. Save categories
      await setDoc(doc(db, 'settings', 'categories'), { items: sourceCategories });

      // 5. Save hero settings
      await setDoc(doc(db, 'settings', 'hero'), sourceHero);

      // 6. Check founder photo
      let cleanFounderImg = sourceFounder.img;
      if (isBase64DataUrl(cleanFounderImg)) {
        try {
          cleanFounderImg = await uploadImageToStorage(cleanFounderImg, 'founder', 'founder_photo.jpg');
        } catch (e) {
          console.warn('Founder image upload error:', e);
        }
      }
      sourceFounder.img = cleanFounderImg;

      // 7. Save site settings
      await setDoc(doc(db, 'settings', 'site'), {
        wa: sourceConfig.wa,
        ship: sourceConfig.ship,
        igh: sourceConfig.igh,
        logo: sourceConfig.logo || 'logo',
        founder: sourceFounder,
        adminEmail: sourceConfig.adminEmail || 'admin@example.com',
      });

      setMigrationStatus((s) => ({
        ...s,
        progress: 85,
        message: 'Syncing reviews, stories, and orders...',
      }));

      // 8. Save reviews
      for (let rIdx = 0; rIdx < sourceReviews.length; rIdx++) {
        await setDoc(doc(db, 'reviews', `rev_${rIdx + 1}`), sourceReviews[rIdx]);
      }

      // 9. Save stories (upload base64 if needed)
      for (let sIdx = 0; sIdx < sourceStories.length; sIdx++) {
        const item = sourceStories[sIdx];
        let sImg = item.img;
        if (isBase64DataUrl(sImg)) {
          try {
            sImg = await uploadImageToStorage(sImg, 'stories', `story_${sIdx + 1}.jpg`);
          } catch {}
        }
        await setDoc(doc(db, 'stories', `story_${sIdx + 1}`), { ...item, img: sImg });
      }

      // 10. Save existing orders
      for (const o of sourceOrders) {
        await setDoc(doc(db, 'orders', o.id), o);
      }

      // 11. Save inquiries
      for (const inq of sourceInquiries) {
        await setDoc(doc(db, 'inquiries', inq.id), inq);
      }

      // 12. Cleanup legacy localStorage keys (RETAINING ONLY CART 'sm_bag' and favorites 'sm_fav')
      const keysToRemove = [
        'sm_p',
        'sm_c',
        'sm_s',
        'sm_cfg',
        'sm_rv',
        'sm_ig',
        'sm_orders',
        'sm_inq',
        'sm_founder',
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('sm_cloud_migrated_done', 'true');

      setMigrationStatus({
        running: false,
        progress: 100,
        message: 'Success! All local data & photos migrated to Firebase Firestore.',
        complete: true,
        error: null,
      });

      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLastSyncError(null);
      showToast('All local data successfully saved to Firestore!');
    } catch (err: any) {
      console.error('Migration failed:', err);
      setMigrationStatus({
        running: false,
        progress: 0,
        message: 'Migration failed',
        complete: false,
        error: err?.message || 'Unknown error during migration',
      });
      showToast('Migration failed. Check Firebase console permissions.');
    }
  };

  // WhatsApp helper
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

  // Live Metrics
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
        isLoading,
        loadError,
        retryLoading,
        lastSyncTime,
        lastSyncError,
        isCloudConnected,
        uploadLocalDataToCloud,
        migrationStatus,
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
        lookupOrder,
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
        removeDuplicateProducts,
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
