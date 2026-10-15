export interface Product {
  id: string;
  name: string;
  sub: string;
  desc?: string;
  cat: string;
  price: number;
  mrp: number;
  badge: string;
  stock: number | boolean;
  vis: number | boolean;
  img: string;
  more?: string[];
  tags?: string[];
}

export interface Category {
  name: string;
  icon: string;
}

export interface Review {
  n: string;
  pl: string;
  r: number;
  t: string;
  img?: string;
}

export interface StoryItem {
  img: string;
  url?: string;
  cap?: string;
}

export interface HeroSettings {
  tick: string;
  title: string;
  sub: string;
  anim: number | boolean;
  slots: string[];
  img?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  q: number;
  img?: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city?: string;
  pincode?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Inquiry' | 'Confirmed' | 'Crafting' | 'Dispatched' | 'Completed';
  paid: boolean;
  createdAt: string;
  notes?: string;
  source: 'Storefront' | 'Instagram' | 'WhatsApp' | 'Manual';
  trackingNumber?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  loc: string;
  phone: string;
  item: string;
  total: number;
  st: number; // 0: Inquiry, 1: Confirmed, 2: Crafting, 3: Dispatched, 4: Completed
  time: string;
  memo: string;
  refs?: string[];
  paid?: boolean;
  due?: string;
  platform?: 'Instagram' | 'WhatsApp' | 'Storefront' | 'Other';
  handle?: string;
}

export interface BagItem {
  id: string;
  q: number;
  note: string;
}

export interface FounderSettings {
  badge: string;
  name: string;
  role: string;
  bio: string;
  img: string;
  badgeIcon?: string;
  chatBtnText?: string;
  chatPrompt?: string;
  secondaryBtnText?: string;
  secondaryBtnAction?: string;
  showSection?: boolean;
}

export interface StoreConfig {
  p: Product[];
  s: HeroSettings;
  c: Category[];
  rv: Review[];
  ig: StoryItem[];
  wa: string;
  ship: {
    fee: number;
    free: number;
  };
  igh: string;
  logo?: string;
  founder?: FounderSettings;
}

export interface DeliveryForm {
  name: string;
  phone: string;
  loc: string;
  city?: string;
  pincode?: string;
  note: string;
}

export interface CustomOrderOptions {
  q: number;
  color: string;
  led: string;
  msg: string;
  pid?: string;
}

export interface DashboardMetrics {
  confirmedOrdersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingInquiriesCount: number;
  craftingCount: number;
  dispatchedCount: number;
  completedCount: number;
  activeProductsCount: number;
  outOfStockCount: number;
}
