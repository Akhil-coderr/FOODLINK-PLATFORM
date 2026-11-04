import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';

export default function ActivityTicker() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecent = async () => {
      try {
        const res = await donationService.getAll({ limit: 6, status: 'AVAILABLE' });
        if (isMounted && res.success && Array.isArray(res.data?.donations) && res.data.donations.length > 0) {
          setItems(res.data.donations);
        }
      } catch (err) {
        // Silently retain fallback messages
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRecent();
    return () => { isMounted = false; };
  }, []);

  // Standard fallback items if data is still fetching or empty
  const defaultItems = [
    { _id: 'd1', foodName: 'Vegetable Dum Biryani', quantity: 38, unit: 'kg', city: 'Peelamedu' },
    { _id: 'd2', foodName: 'South Indian Thali Meals', quantity: 45, unit: 'kg', city: 'RS Puram' },
    { _id: 'd3', foodName: 'Whole Wheat Sourdough Loaves', quantity: 22, unit: 'packets', city: 'Gandhipuram' },
    { _id: 'd4', foodName: 'Pasteurized Fresh Milk & Curd', quantity: 30, unit: 'liters', city: 'Ganapathy' },
    { _id: 'd5', foodName: 'Steamed Idli & Medu Vada Combo', quantity: 26, unit: 'kg', city: 'Saravanampatti' },
  ];

  const activeItems = items.length > 0 ? items : defaultItems;

  return (
    <div className="bg-forest-950 text-emerald-100 border-b border-forest-800/80 py-2 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        {/* Fixed Left Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black shrink-0 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Food Surplus</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="overflow-hidden flex-1 relative mask-fade-edges">
          <div className="ticker-track flex items-center gap-8 text-xs font-semibold whitespace-nowrap">
            {/* Duplicated track for continuous infinite loop */}
            {[...activeItems, ...activeItems].map((item, idx) => (
              <Link
                key={`${item._id}-${idx}`}
                to={`/food/${item._id}`}
                className="inline-flex items-center gap-2 hover:text-white transition group py-0.5"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-white group-hover:underline">{item.foodName}</span>
                <span className="text-emerald-300 font-extrabold bg-forest-900 px-1.5 py-0.2 rounded border border-forest-700">
                  {item.quantity} {item.unit}
                </span>
                <span className="text-slate-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  {item.city || 'Coimbatore'}
                </span>
                <span className="text-slate-600 mx-1">•</span>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <Link
          to="/food"
          className="text-[11px] font-bold text-emerald-300 hover:text-white shrink-0 hidden md:inline-flex items-center gap-1 transition"
        >
          <span>Marketplace</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
