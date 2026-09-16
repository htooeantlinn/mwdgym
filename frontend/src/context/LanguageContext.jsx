import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Navbar & Header
    nav_home: "Home",
    nav_about: "About",
    nav_pricing: "Pricing",
    nav_coaches: "Coaches",
    nav_contact: "Contact",
    nav_market: "Marketplace",
    nav_store: "Store",
    nav_coins: "Coins",
    nav_calc: "Calculator",
    nav_timer: "Timer",
    nav_login: "Sign In",
    nav_join: "JOIN NOW",
    nav_dashboard: "Dashboard",
    nav_profile: "My Profile",
    nav_logout: "Logout",
    nav_tagline: "MYAWADDY • EST 2020",
    active_members: "active members",

    // Banner Announcement
    banner_bonus: "Limited — First 50 new members get +100 bonus coins",
    banner_claim: "Claim Now →",

    // Hero Section
    hero_badge: "#1 GYM — 4.9★ (2,300+ reviews)",
    hero_title_1: "NO EXCUSES.",
    hero_title_2: "JUST RESULTS.",
    hero_subtitle: "Build muscle • Burn fat • Earn coins",
    hero_desc: "Where Discipline Becomes Strength. Certified coaches, workout marketplace, store delivery & coin rewards for every workout. Start today!",
    hero_btn_start: "START FOR FREE",
    hero_btn_tour: "Watch Tour",
    hero_nocard: "No credit card required",
    hero_trust_coaches: "Certified Coaches",
    hero_trust_market: "Workout Marketplace",
    hero_trust_store: "Store & Delivery",
    hero_trust_coins: "Coin Rewards",
    hero_stat_strength: "+12% Strength",
    hero_stat_time: "avg. in 4 weeks",
    hero_stat_earn: "Earn Coins",
    hero_stat_earn_desc: "Every workout = rewards",
    hero_stat_price_from: "FROM",
    hero_stat_price_val: "5,000",
    hero_stat_price_unit: "MMK/mo",

    // Stats Bar
    stat_members: "Members",
    stat_rating: "Rating",
    stat_trainers: "Pro Trainers",
    stat_plans: "Workout Plans",
    stat_shop: "Coin Shop",
    stat_access: "Days Access",

    // Why MWD Gym Section
    why_title_1: "WHY MWD",
    why_title_2: "HITS DIFFERENT",
    why_desc: "Not just a generic gym. Certified coaching + workout marketplace + earnable coin rewards keep you consistent.",
    why_card1_title: "Certified Pro Coaches",
    why_card1_desc: "Get customized routine plans designed by top fitness pros.",
    why_card2_title: "Earn Workout Coins",
    why_card2_desc: "Complete exercises & check-ins to earn coins for supplements & gym gear.",
    why_card3_title: "Equipment & Facilities",
    why_card3_desc: "State-of-the-art heavy lifting rigs, cardio zone & recovery lounge.",
    why_card4_title: "Workout Marketplace",
    why_card4_desc: "Browse premium trainer plans and unlock workouts with your earned coins.",

    // About Page
    about_title: "About MWD Gym",
    about_subtitle: "Our Fitness & Performance Destination",
    about_mission_title: "Our Mission",
    about_mission_desc: "We exist to empower people of all fitness levels in Myanmar to build strength, discipline, and healthy habits that last a lifetime.",
    about_story_title: "Building Strength Since 2020",
    about_story_desc: "MWD GYM started with a single vision: combining world-class equipment with real coaching accountability and an interactive coin rewards system.",
    about_feature1_title: "World Class Rig",
    about_feature1_desc: "Eleiko bars, Rogue power racks, and precision dumbbell sets up to 60kg.",
    about_feature2_title: "Cardio & Endurance",
    about_feature2_desc: "Commercial treadmills, assault bikes, rowing machines with live telemetry.",
    about_feature3_title: "Recovery Lounge",
    about_feature3_desc: "Infrared sauna, massage guns, and protein shake bar.",
    about_feature4_title: "Digital Gym Portal",
    about_feature4_desc: "Track workouts, order supplements, and chat directly with your trainer online.",
    about_rules_title: "Gym House Rules",
    about_rule1: "Re-rack your weights after every set.",
    about_rule2: "Wipe down equipment after use.",
    about_rule3: "Respect fellow members and maintain a clean environment.",

    // Pricing Page
    pricing_title: "Membership Plans",
    pricing_subtitle: "Simple, transparent pricing with no hidden contracts",
    pricing_badge_popular: "MOST POPULAR",
    pricing_per_month: "/ month",
    pricing_btn_select: "Get Started Now",
    pricing_includes: "Plan Features Includes:",
    pricing_coin_bonus: "Bonus Coins Included",
    pricing_faq_title: "Frequently Asked Questions",
    pricing_faq1_q: "Can I cancel my membership anytime?",
    pricing_faq1_a: "Yes, all memberships can be cancelled or paused at any time without extra fees.",
    pricing_faq2_q: "How do coin rewards work?",
    pricing_faq2_a: "You earn coins whenever you log workouts, check into the gym, or complete trainer challenges. Coins can be spent in the Coin Shop for gear and supplements.",
    pricing_faq3_q: "Is trainer support included?",
    pricing_faq3_a: "Pro and Elite plans include 1-on-1 trainer consultation and customized workout plans.",

    // Coaches Page
    coaches_title: "Meet Our Pro Coaches",
    coaches_subtitle: "Certified fitness leaders dedicated to your transformation",
    coaches_filter_all: "All Specialties",
    coaches_filter_hypertrophy: "Bodybuilding",
    coaches_filter_fatloss: "Fat Loss",
    coaches_filter_strength: "Powerlifting",
    coaches_filter_hiit: "HIIT & Cardio",
    coaches_exp: "Years Experience",
    coaches_btn_view: "View Workout Plans",

    // Contact Page
    contact_title: "Contact Us",
    contact_subtitle: "We'd love to welcome you at MWD GYM. Reach out or visit us!",
    contact_info_title: "Gym Location & Details",
    contact_address_label: "Address",
    contact_phone_label: "Phone",
    contact_hours_label: "Opening Hours",
    contact_hours_val: "Mon - Sun: 6:00 AM - 10:00 PM",
    contact_form_title: "Send Us a Message",
    contact_name_label: "Your Full Name",
    contact_email_label: "Contact Email / Phone",
    contact_msg_label: "Your Message",
    contact_btn_send: "Send Message",
    contact_sent_success: "Thank you! We received your message and will contact you shortly.",

    // Footer
    footer_tagline: "Where Discipline Becomes Strength",
    footer_quick_links: "Quick Navigation",
    footer_hours_title: "Operating Hours",
    footer_hours_days: "Monday - Sunday",
    footer_hours_time: "6:00 AM - 10:00 PM",
    footer_rights: "All rights reserved. MWD GYM.",
  },
  mm: {
    // Navbar & Header
    nav_home: "ပင်မစာမျက်နှာ",
    nav_about: "အကြောင်း",
    nav_pricing: "စျေးနှုန်းများ",
    nav_coaches: "နည်းပြများ",
    nav_contact: "ဆက်သွယ်ရန်",
    nav_market: "ဈေးကွက်",
    nav_store: "စတိုးဆိုင်",
    nav_coins: "ဒင်္ဂါးပြားများ",
    nav_calc: "တွက်ချက်ရန်",
    nav_timer: "အချိန်တိုင်းစက်",
    nav_login: "ဝင်ရောက်ရန်",
    nav_join: "အခုပဲ ပါဝင်ပါ",
    nav_dashboard: "ဒက်ရှ်ဘုတ်",
    nav_profile: "ကျွန်ုပ်၏ ပရိုဖိုင်",
    nav_logout: "ထွက်ရန်",
    nav_tagline: "မြဝတီ • စတင် ၂၀၂၀",
    active_members: "အသုံးပြုနေသော အဖွဲ့ဝင်များ",

    // Banner Announcement
    banner_bonus: "အထူးကမ်းလှမ်းချက် — ပထမဆုံး အဖွဲ့ဝင် ၅၀ အတွက် +၁၀၀ အပိုဆုဒင်္ဂါးပြားများ ရရှိမည်",
    banner_claim: "အခုပဲ ရယူပါ →",

    // Hero Section
    hero_badge: "ထိပ်တန်း အားကစားရုံ — ၄.၉★ (သုံးသပ်ချက် ၂,၃၀၀+)",
    hero_title_1: "ဆင်ခြေမရှိ။",
    hero_title_2: "ရလဒ်များသာ။",
    hero_subtitle: "ကြွက်သားတည်ဆောက်ပါ • အဆီချပါ • ဒင်္ဂါးပြားများရယူပါ",
    hero_desc: "စည်းကမ်းမှသည် ခွန်အားဆီသို့။ ကျွမ်းကျင်အသိအမှတ်ပြု နည်းပြများ၊ လေ့ကျင့်ခန်း ပရိုဂရမ်ဈေးကွက်၊ စတိုးဆိုင်နှင့် လေ့ကျင့်ခန်းတိုင်းအတွက် ဆုလာဘ်ဒင်္ဂါးပြားများ။ ဒီနေ့ပဲ စတင်လိုက်ပါ။",
    hero_btn_start: "အခမဲ့ စတင်ပါ",
    hero_btn_tour: "လေ့လာကြည့်ပါ",
    hero_nocard: "ခရက်ဒစ်ကတ် မလိုပါ",
    hero_trust_coaches: "အသိအမှတ်ပြု နည်းပြများ",
    hero_trust_market: "လေ့ကျင့်ခန်း ဈေးကွက်",
    hero_trust_store: "စတိုးဆိုင်နှင့် အိမ်ရောက်ပို့ဆောင်မှု",
    hero_trust_coins: "ဆုလာဘ်ဒင်္ဂါးပြားများ",
    hero_stat_strength: "+၁၂% ခွန်အားတိုးတက်မှု",
    hero_stat_time: "၄ ပတ်အတွင်း ပျမ်းမျှရလဒ်",
    hero_stat_earn: "ဒင်္ဂါးပြားများ ရယူပါ",
    hero_stat_earn_desc: "လေ့ကျင့်ခန်းတိုင်း = ဆုလာဘ်များ",
    hero_stat_price_from: "စတင်စျေးနှုန်း",
    hero_stat_price_val: "၅,၀၀၀",
    hero_stat_price_unit: "ကျပ်/လ",

    // Stats Bar
    stat_members: "အဖွဲ့ဝင်များ",
    stat_rating: "အဆင့်သတ်မှတ်ချက်",
    stat_trainers: "ကျွမ်းကျင်နည်းပြများ",
    stat_plans: "လေ့ကျင့်ခန်း အစီအစဉ်များ",
    stat_shop: "ဒင်္ဂါးစတိုးဆိုင်",
    stat_access: "ဖွင့်လှစ်သည့်ရက်",

    // Why MWD Gym Section
    why_title_1: "ဘာကြောင့် MWD GYM ကို",
    why_title_2: "ရွေးချယ်သင့်သလဲ",
    why_desc: "ရိုးရိုး အားကစားရုံ မဟုတ်ပါ။ ကျွမ်းကျင်နည်းပြများ၊ လေ့ကျင့်ခန်းဈေးကွက်နှင့် ဒင်္ဂါးပြား ဆုလာဘ်စနစ်တို့ဖြင့် သင့်ကို စွဲမြဲစေပါသည်။",
    why_card1_title: "အသိအမှတ်ပြု ကျွမ်းကျင်နည်းပြများ",
    why_card1_desc: "ထိပ်တန်း နည်းပြများ ရေးဆွဲထားသော စနစ်ကျ လေ့ကျင့်ခန်း ပရိုဂရမ်များ။",
    why_card2_title: "လေ့ကျင့်ခန်း ဆုလာဘ် ဒင်္ဂါးပြားများ",
    why_card2_desc: "လေ့ကျင့်ခန်းများ ပြီးမြောက်ပါက ဒင်္ဂါးပြားများ ရရှိပြီး ဖြည့်စွက်စာနှင့် အားကစားပစ္စည်းများ လဲလှယ်နိုင်သည်။",
    why_card3_title: "ခေတ်မီ အဆင့်မြင့် စက်ကိရိယာများ",
    why_card3_desc: "အလေးမ စက်ကိရိယာများ၊ ကာဒီယို ဇုန်နှင့် အနားယူရာ နေရာများ စုံလင်စွာ ပါဝင်ပါသည်။",
    why_card4_title: "လေ့ကျင့်ခန်း ဈေးကွက်",
    why_card4_desc: "ကျွမ်းကျင်နည်းပြများ၏ ပရိုဂရမ်များကို ဝင်ရောက်ကြည့်ရှုပြီး ရရှိထားသော ဒင်္ဂါးပြားများဖြင့် ဝယ်ယူနိုင်သည်။",

    // About Page
    about_title: "MWD Gym အကြောင်း",
    about_subtitle: "အဆင့်မြင့် ကျန်းမာကြံ့ခိုင်ရေး ကလပ်",
    about_mission_title: "ကျွန်ုပ်တို့၏ ရည်မှန်းချက်",
    about_mission_desc: "မြန်မာနိုင်ငံရှိ အားကစားဝါသနာရှင် အားလုံးအတွက် ခွန်အား၊ စည်းကမ်းနှင့် ရေရှည်တည်တံ့သော ကျန်းမာရေး အလေ့အထများ တည်ဆောက်ပေးရန် ရည်ရွယ်ပါသည်။",
    about_story_title: "၂၀၂၀ မှစတင်၍ ခွန်အားများ တည်ဆောက်ခြင်း",
    about_story_desc: "MWD GYM ကို အဆင့်မြင့် စက်ကိရိယာများ၊ နည်းပြစနစ်နှင့် ဒင်္ဂါးပြား ဆုလာဘ်စနစ်တို့ ပေါင်းစပ်၍ စတင်တည်ထောင်ခဲ့ပါသည်။",
    about_feature1_title: "ကမ္ဘာ့အဆင့်မီ အလေးမ စက်ကိရိယာများ",
    about_feature1_desc: "Eleiko ဘားများနှင့် Rogue ရက်ခ်များ၊ ၆၀ ကီလိုအထိ ရှိသော ဒမ်ဘယ်များ။",
    about_feature2_title: "ကာဒီယိုနှင့် ကြံ့ခိုင်မှု ဇုန်",
    about_feature2_desc: "စက်ဘီးများ၊ ပြေးစက်များနှင့် အောက်ဆီဂျင် တိုင်းတာနိုင်သော စက်ကိရိယာများ။",
    about_feature3_title: "အနားယူစခန်း lounge",
    about_feature3_desc: "အင်ဖရာရက် ဆော်နာ၊ မာဆတ်စက်များနှင့် ပရိုတင်း ရှိတ်ဘား။",
    about_feature4_title: "ဒီဂျစ်တယ် GYM ပေါ်တယ်",
    about_feature4_desc: "လေ့ကျင့်ခန်း မှတ်တမ်းများကြည့်ခြင်း၊ ဖြည့်စွက်စာ မှာယူခြင်းနှင့် နည်းပြများနှင့် တိုက်ရိုက် စကားပြောနိုင်ခြင်း။",
    about_rules_title: "ကလပ်စည်းကမ်းများ",
    about_rule1: "လေ့ကျင့်ခန်း ပြီးပါက အလေးများကို မူလနေရာတွင် ပြန်ထားပါ။",
    about_rule2: "စက်ကိရိယာများ သုံးပြီးပါက သန့်ရှင်းရေး ပြုလုပ်ပါ။",
    about_rule3: "အခြားအဖွဲ့ဝင်များကို လေးစားပြီး သန့်ရှင်းမှုကို ထိန်းသိမ်းပါ။",

    // Pricing Page
    pricing_title: "အဖွဲ့ဝင် အစီအစဉ်များနှင့် စျေးနှုန်းများ",
    pricing_subtitle: "ရှင်းလင်းဆန်းသစ်သော စျေးနှုန်းများ (စာချုပ်ချုပ်ရန် မလိုပါ)",
    pricing_badge_popular: "လူကြိုက်အများဆုံး",
    pricing_per_month: "/ လစဉ်",
    pricing_btn_select: "အခုပဲ စတင်ပါ",
    pricing_includes: "ပါဝင်သော ဝန်ဆောင်မှုများ:",
    pricing_coin_bonus: "အပိုဆု ဒင်္ဂါးပြားများ ပါဝင်သည်",
    pricing_faq_title: "မကြာခဏ မေးလေ့ရှိသော မေးခွန်းများ",
    pricing_faq1_q: "အဖွဲ့ဝင်ခြင်းကို အချိန်မရွေး ပယ်ဖျက်နိုင်ပါသလား။",
    pricing_faq1_a: "ဟုတ်ကဲ့၊ အပိုကြေး မပေးရဘဲ မည်သည့်အချိန်မဆို ရပ်နား သို့မဟုတ် ပယ်ဖျက်နိုင်ပါသည်။",
    pricing_faq2_q: "ဒင်္ဂါးပြား ဆုလာဘ်စနစ် ဘယ်လိုအလုပ်လုပ်သလဲ။",
    pricing_faq2_a: "လေ့ကျင့်ခန်း လုပ်သည့်အခါ သို့မဟုတ် GYM သို့ လာရောက်သည့်အခါ ဒင်္ဂါးပြားများ ရရှိပါမည်။ ၎င်းဒင်္ဂါးများဖြင့် စတိုးဆိုင်မှ ပစ္စည်းများ လဲလှယ်နိုင်ပါသည်။",
    pricing_faq3_q: "နည်းပြ အကူအညီ ပါဝင်ပါသလား။",
    pricing_faq3_a: "Pro နှင့် Elite အစီအစဉ်များတွင် ၁ စီး ၁ နည်းပြ ဆွေးနွေးမှုနှင့် သီးသန့် လေ့ကျင့်ခန်း ပရိုဂရမ်များ ပါဝင်ပါသည်။",

    // Coaches Page
    coaches_title: "ကျွမ်းကျင် နည်းပြများနှင့် တွေ့ဆုံပါ",
    coaches_subtitle: "သင့်၏ ခန္ဓာကိုယ် ပြောင်းလဲမှုအတွက် ကူညီပေးမည့် အသိအမှတ်ပြု နည်းပြများ",
    coaches_filter_all: "အထူးပြု အားလုံး",
    coaches_filter_hypertrophy: "ကြွက်သား တည်ဆောက်ခြင်း",
    coaches_filter_fatloss: "အဆီချခြင်း",
    coaches_filter_strength: "ပေ့ါဝါလစ်တင်း",
    coaches_filter_hiit: "ကာဒီယိုနှင့် HIIT",
    coaches_exp: "နှစ် အတွေ့အကြုံ",
    coaches_btn_view: "လေ့ကျင့်ခန်း ပရိုဂရမ်များ ကြည့်ရန်",

    // Contact Page
    contact_title: "ဆက်သွယ်ရန်",
    contact_subtitle: "MWD GYM မှ သင့်ကို နွေးထွေးစွာ ကြိုဆိုပါသည်။ ကျွန်ုပ်တို့ထံ လာရောက်လေ့လာပါ!",
    contact_info_title: "ကလပ် တည်နေရာနှင့် အချက်အလက်များ",
    contact_address_label: "လိပ်စာ",
    contact_phone_label: "ဖုန်းနံပါတ်",
    contact_hours_label: "ဖွင့်လှစ်ချိန်",
    contact_hours_val: "တနင်္လာ - တနင်္ဂနွေ: နံနက် ၆:၀၀ - ည ၁၀:၀၀",
    contact_form_title: "သတင်းလွှာ ပေးပို့ပါ",
    contact_name_label: "သင့်အမည်",
    contact_email_label: "အီးမေးလ် / ဖုန်းနံပါတ်",
    contact_msg_label: "စာတို",
    contact_btn_send: "ပေးပို့မည်",
    contact_sent_success: "ကျေးဇူးတင်ပါသည်။ သင့်စာတိုကို လက်ခံရရှိပြီး မကြာမီ ပြန်လည်ဆက်သွယ်ပါမည်။",

    // Footer
    footer_tagline: "စည်းကမ်းမှသည် ခွန်အားဆီသို့",
    footer_quick_links: "လျင်မြန်သော လင့်ခ်များ",
    footer_hours_title: "ဖွင့်လှစ်ချိန်",
    footer_hours_days: "တနင်္လာ မှ တနင်္ဂနွေ",
    footer_hours_time: "နံနက် ၆:၀၀ မှ ည ၁၀:၀၀ ထိ",
    footer_rights: "မူပိုင်ခွင့်များ ရရှိပြီး။ MWD GYM။",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('mwd-lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('mwd-lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'mm' : 'en'));
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
