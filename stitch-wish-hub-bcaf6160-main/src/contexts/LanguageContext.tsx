import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface Translations {
  [key: string]: {
    en: string;
    bn: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', bn: 'হোম' },
  tailors: { en: 'Tailors', bn: 'দর্জি' },
  login: { en: 'Login', bn: 'লগইন' },
  signup: { en: 'Sign Up', bn: 'সাইন আপ' },
  logout: { en: 'Logout', bn: 'লগআউট' },
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  profile: { en: 'Profile', bn: 'প্রোফাইল' },
  orders: { en: 'Orders', bn: 'অর্ডার' },
  messages: { en: 'Messages', bn: 'বার্তা' },
  
  // Hero Section
  heroTitle: { en: 'Find Your Perfect Tailor', bn: 'আপনার পারফেক্ট দর্জি খুঁজুন' },
  heroSubtitle: { en: 'Connect with skilled tailors for custom clothing', bn: 'কাস্টম পোশাকের জন্য দক্ষ দর্জিদের সাথে সংযুক্ত হন' },
  searchPlaceholder: { en: 'Search tailors, styles, locations...', bn: 'দর্জি, স্টাইল, অবস্থান খুঁজুন...' },
  
  // Categories
  traditional: { en: 'Traditional Wear', bn: 'ঐতিহ্যবাহী পোশাক' },
  westernFormal: { en: 'Western Formal', bn: 'পশ্চিমা ফর্মাল' },
  bridalWedding: { en: 'Bridal & Wedding', bn: 'বিবাহ ও বিয়ে' },
  alterations: { en: 'Alterations', bn: 'পরিবর্তন' },
  
  // Tailor Card
  rating: { en: 'Rating', bn: 'রেটিং' },
  reviews: { en: 'reviews', bn: 'রিভিউ' },
  available: { en: 'Available', bn: 'উপলব্ধ' },
  busy: { en: 'Busy', bn: 'ব্যস্ত' },
  viewProfile: { en: 'View Profile', bn: 'প্রোফাইল দেখুন' },
  bookNow: { en: 'Book Now', bn: 'এখনই বুক করুন' },
  verified: { en: 'Verified', bn: 'যাচাইকৃত' },
  viewAll: { en: 'View All', bn: 'সব দেখুন' },
  
  // Auth
  email: { en: 'Email', bn: 'ইমেইল' },
  password: { en: 'Password', bn: 'পাসওয়ার্ড' },
  fullName: { en: 'Full Name', bn: 'পুরো নাম' },
  phone: { en: 'Phone', bn: 'ফোন' },
  confirmPassword: { en: 'Confirm Password', bn: 'পাসওয়ার্ড নিশ্চিত করুন' },
  registerAsTailor: { en: 'Register as Tailor', bn: 'দর্জি হিসেবে নিবন্ধন করুন' },
  registerAsCustomer: { en: 'Register as Customer', bn: 'গ্রাহক হিসেবে নিবন্ধন করুন' },
  alreadyHaveAccount: { en: 'Already have an account?', bn: 'ইতিমধ্যে অ্যাকাউন্ট আছে?' },
  dontHaveAccount: { en: "Don't have an account?", bn: 'অ্যাকাউন্ট নেই?' },
  registerAs: { en: 'Register as:', bn: 'হিসেবে নিবন্ধন করুন:' },
  welcomeBack: { en: 'Welcome back! Please login to continue.', bn: 'স্বাগতম! লগইন করুন।' },
  createAccount: { en: 'Create your account to get started.', bn: 'শুরু করতে আপনার অ্যাকাউন্ট তৈরি করুন।' },
  
  // Dashboard
  myOrders: { en: 'My Orders', bn: 'আমার অর্ডার' },
  myMeasurements: { en: 'My Measurements', bn: 'আমার মাপ' },
  savedTailors: { en: 'Saved Tailors', bn: 'সংরক্ষিত দর্জি' },
  welcomeDashboard: { en: 'Welcome! View your orders and measurements here.', bn: 'স্বাগতম! আপনার অর্ডার এবং মাপ এখানে দেখুন।' },
  noOrders: { en: 'No orders yet', bn: 'কোন অর্ডার নেই' },
  noOrdersDesc: { en: "You haven't placed any orders yet", bn: 'এখনো কোন অর্ডার দেননি' },
  findTailors: { en: 'Find Tailors', bn: 'দর্জি খুঁজুন' },
  notifications: { en: 'Notifications', bn: 'নোটিফিকেশন' },
  newNotifications: { en: 'New Notifications', bn: 'নতুন নোটিফিকেশন' },
  noNotifications: { en: 'No notifications', bn: 'কোন নোটিফিকেশন নেই' },
  noNotificationsDesc: { en: 'No new messages for you', bn: 'আপনার জন্য কোন নতুন বার্তা নেই' },
  new: { en: 'New', bn: 'নতুন' },
  orderDate: { en: 'Order', bn: 'অর্ডার' },
  deliveryDate: { en: 'Delivery', bn: 'ডেলিভারি' },
  details: { en: 'Details', bn: 'বিস্তারিত' },
  giveReview: { en: 'Give Review', bn: 'রিভিউ দিন' },
  
  // Order Status
  pending: { en: 'Pending', bn: 'মুলতুবি' },
  accepted: { en: 'Accepted', bn: 'গৃহীত' },
  inProgress: { en: 'In Progress', bn: 'প্রগতিতে' },
  in_progress: { en: 'In Progress', bn: 'প্রগতিতে' },
  ready: { en: 'Ready', bn: 'প্রস্তুত' },
  delivered: { en: 'Delivered', bn: 'বিতরণ করা হয়েছে' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
  
  // Common
  search: { en: 'Search', bn: 'অনুসন্ধান' },
  filter: { en: 'Filter', bn: 'ফিল্টার' },
  sortBy: { en: 'Sort By', bn: 'সাজান' },
  price: { en: 'Price', bn: 'মূল্য' },
  location: { en: 'Location', bn: 'অবস্থান' },
  submit: { en: 'Submit', bn: 'জমা দিন' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  save: { en: 'Save', bn: 'সংরক্ষণ' },
  edit: { en: 'Edit', bn: 'সম্পাদনা' },
  delete: { en: 'Delete', bn: 'মুছুন' },
  loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
  noResults: { en: 'No results found', bn: 'কোন ফলাফল পাওয়া যায়নি' },
  notSet: { en: 'Not set', bn: 'সেট করা হয়নি' },
  
  // Measurements
  chest: { en: 'Chest', bn: 'বুক' },
  waist: { en: 'Waist', bn: 'কোমর' },
  hips: { en: 'Hips', bn: 'নিতম্ব' },
  shoulderWidth: { en: 'Shoulder Width', bn: 'কাঁধের প্রস্থ' },
  armLength: { en: 'Arm Length', bn: 'বাহুর দৈর্ঘ্য' },
  inseam: { en: 'Inseam', bn: 'ভেতরের সীম' },
  neck: { en: 'Neck', bn: 'গলা' },
  thigh: { en: 'Thigh', bn: 'উরু' },
  
  // Tailor Dashboard
  shopName: { en: 'Shop Name', bn: 'দোকানের নাম' },
  description: { en: 'Description', bn: 'বিবরণ' },
  address: { en: 'Address', bn: 'ঠিকানা' },
  city: { en: 'City', bn: 'শহর' },
  specialties: { en: 'Specialties', bn: 'বিশেষত্ব' },
  portfolio: { en: 'Portfolio', bn: 'পোর্টফোলিও' },
  pricing: { en: 'Pricing', bn: 'মূল্য তালিকা' },
  deals: { en: 'Deals & Offers', bn: 'ডিল ও অফার' },
  earnings: { en: 'Earnings', bn: 'উপার্জন' },
  tailorDashboard: { en: 'Tailor Dashboard', bn: 'দর্জি ড্যাশবোর্ড' },
  shopSetup: { en: 'Setup Shop', bn: 'দোকান সেটআপ করুন' },
  shopSetupDesc: { en: 'Create your tailor profile', bn: 'আপনার দর্জির প্রোফাইল তৈরি করুন' },
  startSetup: { en: 'Start Setup', bn: 'সেটআপ শুরু করুন' },
  shopInfo: { en: 'Shop Information', bn: 'দোকানের তথ্য' },
  shopInfoDesc: { en: 'Customers will find you using this information', bn: 'গ্রাহকরা এই তথ্য দেখে আপনাকে খুঁজে পাবে' },
  createShop: { en: 'Create Shop', bn: 'দোকান তৈরি করুন' },
  pendingOrders: { en: 'Pending Orders', bn: 'মুলতুবি অর্ডার' },
  activeOrders: { en: 'Active Orders', bn: 'চলমান অর্ডার' },
  completedOrders: { en: 'Completed Orders', bn: 'সম্পন্ন অর্ডার' },
  totalEarnings: { en: 'Total Earnings', bn: 'মোট আয়' },
  noOrdersYet: { en: 'No orders yet', bn: 'কোন অর্ডার নেই' },
  noOrdersReceived: { en: 'No orders received yet', bn: 'এখনো কোন অর্ডার আসেনি' },
  delivery: { en: 'Delivery', bn: 'ডেলিভারি' },
  addPhoto: { en: 'Add Photo', bn: 'ছবি যোগ করুন' },
  noPortfolioYet: { en: 'No portfolio photos yet', bn: 'এখনো কোন পোর্টফোলিও ছবি নেই' },
  uploadWorkPhotos: { en: 'Upload your work photos', bn: 'আপনার কাজের ছবি আপলোড করুন' },
  addPrice: { en: 'Add Price', bn: 'মূল্য যোগ করুন' },
  noPricingYet: { en: 'No pricing list yet', bn: 'এখনো কোন মূল্য তালিকা নেই' },
  addGarmentPrices: { en: 'Add prices for different garments', bn: 'বিভিন্ন পোশাকের মূল্য যোগ করুন' },
  availableNow: { en: 'You can now receive orders', bn: 'আপনি এখন অর্ডার নিতে পারবেন' },
  notAvailable: { en: 'You cannot receive orders now', bn: 'আপনি এখন অর্ডার নিতে পারবেন না' },
  orderUpdate: { en: 'Order Update', bn: 'অর্ডার আপডেট' },
  orderStatusUpdated: { en: 'Your order status has been updated', bn: 'আপনার অর্ডারের স্ট্যাটাস আপডেট হয়েছে' },
  selectOnMap: { en: 'Select on Map', bn: 'ম্যাপে সিলেক্ট করুন' },
  clickBodyPart: { en: 'Click on a body part to enter measurements', bn: 'শরীরের অংশে ক্লিক করুন মাপ দিতে' },
  savedMeasurements: { en: 'Your saved measurements', bn: 'আপনার সংরক্ষিত মাপ' },
  enterMeasurement: { en: 'Enter Measurement', bn: 'মাপ দিন' },
  inch: { en: 'inch', bn: 'ইঞ্চি' },
  useCurrentLocation: { en: 'Use Current Location', bn: 'বর্তমান অবস্থান ব্যবহার করুন' },
  
  // How it Works
  howItWorks: { en: 'How It Works', bn: 'কিভাবে কাজ করে' },
  howItWorksSubtitle: { en: 'Get custom tailored clothes in 4 simple steps', bn: '৪টি সহজ ধাপে কাস্টম তৈরি পোশাক পান' },
  step: { en: 'Step', bn: 'ধাপ' },
  findTailor: { en: 'Find a Tailor', bn: 'দর্জি খুঁজুন' },
  findTailorDesc: { en: 'Browse through our curated list of skilled tailors based on your location and needs.', bn: 'আপনার অবস্থান এবং প্রয়োজন অনুযায়ী দক্ষ দর্জিদের তালিকা ব্রাউজ করুন।' },
  shareMeasurements: { en: 'Share Measurements', bn: 'মাপ শেয়ার করুন' },
  shareMeasurementsDesc: { en: 'Save your body measurements once and use them for all your future orders.', bn: 'একবার আপনার শরীরের মাপ সংরক্ষণ করুন এবং ভবিষ্যতের সব অর্ডারের জন্য ব্যবহার করুন।' },
  placeOrder: { en: 'Place Order', bn: 'অর্ডার দিন' },
  placeOrderDesc: { en: 'Upload your design, select fabric preferences, and place your order.', bn: 'আপনার ডিজাইন আপলোড করুন, কাপড়ের পছন্দ নির্বাচন করুন এবং অর্ডার দিন।' },
  rateReview: { en: 'Rate & Review', bn: 'রেটিং দিন' },
  rateReviewDesc: { en: 'Receive your perfectly tailored outfit and share your experience.', bn: 'আপনার নিখুঁত পোশাক গ্রহণ করুন এবং আপনার অভিজ্ঞতা শেয়ার করুন।' },
  
  // Footer
  aboutUs: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  contactUs: { en: 'Contact Us', bn: 'যোগাযোগ করুন' },
  privacyPolicy: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },
  termsOfService: { en: 'Terms of Service', bn: 'সেবার শর্তাবলী' },
  allRightsReserved: { en: 'All rights reserved', bn: 'সর্বস্বত্ব সংরক্ষিত' },
  
  // Featured
  featuredTailors: { en: 'Featured Tailors', bn: 'বৈশিষ্ট্যযুক্ত দর্জি' },
  topRated: { en: 'Top Rated', bn: 'শীর্ষ রেটেড' },
  bestDeals: { en: 'Best Deals', bn: 'সেরা ডিল' },
  nearYou: { en: 'Near You', bn: 'আপনার কাছে' },
  noTailorsYet: { en: 'No tailors available yet. Be the first to join!', bn: 'এখনো কোন দর্জি নেই। প্রথম হোন!' },
  
  // Tailor Setup
  yourShopName: { en: 'Your shop name', bn: 'আপনার দোকানের নাম' },
  writeAboutShop: { en: 'Write about your shop...', bn: 'আপনার দোকান সম্পর্কে কিছু লিখুন...' },
  cityArea: { en: 'City/Area', bn: 'শহর/এলাকা' },
  fullAddress: { en: 'Full Address', bn: 'সম্পূর্ণ ঠিকানা' },
  shopNameRequired: { en: 'Please enter shop name', bn: 'দোকানের নাম দিন' },
  shopCreated: { en: 'Your shop has been created!', bn: 'আপনার দোকান তৈরি হয়েছে!' },

  // Call & AI Assistant
  callNow: { en: 'Call Now', bn: 'কল করুন' },
  aiAssistant: { en: 'AI Assistant', bn: 'এআই সহকারী' },
  aiWelcome: {
    en: "Hi! I'm your TailorHub assistant. Ask me to recommend tailors, help with measurements, write order descriptions, or answer questions.",
    bn: 'হাই! আমি আপনার TailorHub সহকারী। দর্জি সুপারিশ, মাপ নিতে সাহায্য, অর্ডার বিবরণ লেখা বা যেকোনো প্রশ্ন করতে পারেন।',
  },
  askAnything: { en: 'Ask anything...', bn: 'কিছু জিজ্ঞাসা করুন...' },
  send: { en: 'Send', bn: 'পাঠান' },
  thinking: { en: 'Thinking…', bn: 'ভাবছি…' },
  aiError: {
    en: 'Something went wrong. Please try again.',
    bn: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
