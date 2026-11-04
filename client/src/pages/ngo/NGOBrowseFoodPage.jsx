import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { FOOD_CATEGORIES } from '../../constants';
import { Search, MapPin, Clock, Compass, Filter } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function NGOBrowseFoodPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await donationService.getAll({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: 'AVAILABLE',
      });
      if (res.success && res.data?.donations) {
        setDonations(res.data.donations);
      } else {
        setDonations([]);
      }
    } catch (err) {
      console.error('Error fetching food', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFood();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFood();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Browse Available Food</h1>
          <p className="text-xs text-brandText-muted mt-0.5">
            Discover edible surplus donations ready for immediate collection.
          </p>
        </div>
        <Link
          to="/ngo/matching"
          className="inline-flex items-center text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition"
        >
          View Smart Algorithm Recommendations →
        </Link>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-forest-900 text-white rounded-xl text-xs font-bold hover:bg-forest-800"
          >
            Search
          </button>
        </form>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-surface-border bg-white"
        >
          <option value="">All Categories</option>
          {FOOD_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Searching surplus meals..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No food matches found"
          description="Try selecting another category or check back shortly."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl overflow-hidden border border-surface-border shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={
                      d.imageUrl ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
                    }
                    alt={d.foodName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-amber-300" />
                    {new Date(d.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                    {d.foodCategory}
                  </span>
                  <h3 className="font-bold text-base text-brandText-primary line-clamp-1">{d.foodName}</h3>
                  <p className="text-xs text-brandText-muted line-clamp-2">{d.description}</p>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 font-semibold">
                    <span>
                      Quantity: <strong className="text-forest-900">{d.quantity} {d.unit}</strong>
                    </span>
                    <span className="text-brandText-muted flex items-center">
                      <MapPin className="w-3 h-3 mr-0.5 text-forest-600" />
                      {d.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/ngo/food/${d._id}`}
                  className="w-full block text-center py-2.5 px-4 bg-forest-900 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition"
                >
                  View Details & Request Batch
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
