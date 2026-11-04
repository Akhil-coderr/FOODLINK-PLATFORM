import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  HelpCircle, X, ChevronDown, CheckCircle2, ShieldCheck, 
  Utensils, Truck, Award, BookOpen, ExternalLink, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ_TOPICS = [
  {
    id: 'how-to-donate',
    title: 'How do I donate surplus food?',
    icon: Utensils,
    content: 'Restaurants, hotels, caterers and individuals can register as Donors and click "List Surplus Food". Specify the food name, quantity, estimated servings, safe expiry window, and pickup coordinates. Verified local NGOs and volunteers are instantly alerted.'
  },
  {
    id: 'accepted-categories',
    title: 'What food categories are accepted?',
    icon: CheckCircle2,
    content: 'We accept Cooked Meals, Rice & Biryani, Fresh Vegetables, Fresh Fruits, Bakery Products, Bread & Buns, Packaged Food, Grocery Items, Breakfast/Lunch/Dinner Meals, Snacks, Canned Food, and Dairy Products (with cold-chain storage at 0-4°C). Expired, spoiled, or unhygienic foods are strictly rejected.'
  },
  {
    id: 'food-safety',
    title: 'Food Safety & Hygiene Guidelines',
    icon: ShieldCheck,
    content: 'All donations must comply with FSSAI hygiene standards. Cooked meals must be packed in clean food-grade thermal containers. Hot food must be held at 60°C or above, and dairy/cold items refrigerated at 0-4°C. Donors must provide honest preparation time and safe consumption limits.'
  },
  {
    id: 'qr-verification',
    title: 'How does QR verification work?',
    icon: Truck,
    content: 'Every claimed donation generates a single-use cryptographic QR code. Volunteers scan the donor’s QR token upon pickup, and the receiving NGO shelter scans the delivery QR upon handover. This ensures full traceability and eliminates duplicate claims.'
  },
  {
    id: 'ngo-verification',
    title: 'How do NGOs get accredited?',
    icon: BookOpen,
    content: 'NGOs must register with their official government registration certificate, FCRA/12A/80G documents, and shelter receiving capacity. FoodLink platform administrators audit each organization before granting claiming privileges.'
  },
  {
    id: 'karma-rewards',
    title: 'Karma Points & Hotel Coupons',
    icon: Award,
    content: 'Volunteers and donors earn Karma Points for every successful meal rescue dropoff. Points can be redeemed for exclusive Hotel Coupons and milestone achievement badges on the Volunteer Rewards dashboard.'
  }
];

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTopic, setActiveTopic] = useState('how-to-donate');
  const panelRef = useRef(null);
  const location = useLocation();
  const path = location.pathname;

  // Hide on auth, admin, creation, or dashboard pages
  const isExcluded =
    path.startsWith('/admin') ||
    path.includes('/login') ||
    path.includes('/register') ||
    path.includes('/donations/create') ||
    path.includes('/donor') ||
    path.includes('/ngo') ||
    path.includes('/volunteer');

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  if (isExcluded) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 left-5 z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Compact Launcher Button (expands on hover/touch) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xl border-2 border-emerald-500/40 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-95 ${
          isHovered || isOpen ? 'h-11 px-3.5 gap-2' : 'h-11 w-11 justify-center'
        }`}
        aria-label="Open FoodLink Help & Guidelines"
        title="FoodLink Knowledge & Guidelines"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
        </div>
        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-300 font-extrabold text-slate-900 ${
            isHovered || isOpen ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          FoodLink Guide
        </span>
      </button>

      {/* Slide-up Popover Support Panel */}
      {isOpen && (
        <div className="absolute bottom-14 left-0 w-[92vw] sm:w-[420px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border-2 border-emerald-600/30 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center border border-emerald-400/30">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">FoodLink Knowledge Center</h3>
                <p className="text-[11px] text-emerald-200">Instant answers & food safety guidelines</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
              aria-label="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body FAQs */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[60vh] divide-y divide-slate-100">
            {FAQ_TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isSelected = activeTopic === topic.id;
              return (
                <div key={topic.id} className="pt-2 first:pt-0">
                  <button
                    type="button"
                    onClick={() => setActiveTopic(isSelected ? '' : topic.id)}
                    className="w-full text-left py-2 px-2.5 rounded-xl flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 line-clamp-1">{topic.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isSelected ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>

                  {isSelected && (
                    <div className="px-3 py-2.5 mt-1 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] font-semibold text-slate-800 leading-relaxed animate-in fade-in duration-150">
                      {topic.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Quick Links */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1"
            >
              <span>About Mission</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1"
            >
              <span>Contact Support</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
