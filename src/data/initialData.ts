import { Product, Category, Review, StoryItem, HeroSettings, Inquiry, StoreConfig, Order, FounderSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_HERO: HeroSettings = {
  tick: 'Enter order instructions here',
  title: 'Your Craft Business Name',
  sub: 'High-quality products handcrafted with care.',
  anim: 1,
  slots: [],
  img: 'placeholder',
};

export const INITIAL_CATEGORIES: Category[] = [
  { name: 'Category 1', icon: 'category' },
  { name: 'Category 2', icon: 'category' },
];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_STORIES: StoryItem[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INQUIRIES: Inquiry[] = [];

export const INITIAL_FOUNDER: FounderSettings = {
  badge: 'Meet the Founder',
  name: 'Your Name',
  role: 'Founder',
  bio: 'Insert your story here.',
  img: 'founder-placeholder',
  badgeIcon: '✨',
  chatBtnText: 'Contact Us',
  chatPrompt: 'Hi, I would like to know more about your products.',
  secondaryBtnText: 'Custom Request',
  secondaryBtnAction: 'custom',
  showSection: true,
};

export const INITIAL_CONFIG: StoreConfig = {
  p: INITIAL_PRODUCTS,
  s: INITIAL_HERO,
  c: INITIAL_CATEGORIES,
  rv: INITIAL_REVIEWS,
  ig: INITIAL_STORIES,
  wa: 'YOUR_WHATSAPP_NUMBER',
  ship: {
    fee: 0,
    free: 9999,
  },
  igh: 'YOUR_INSTAGRAM_HANDLE',
  logo: 'logo',
  founder: INITIAL_FOUNDER,
  adminEmail: 'admin@example.com',
};

export const STAGES = ['Inquiry', 'Confirmed', 'Crafting', 'Dispatched', 'Completed'] as const;
