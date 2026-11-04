import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { FOOD_CATEGORIES } from '../../constants';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Compass,
  ArrowUpDown,
  UtensilsCrossed,
  Layers,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function AvailableFoodPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('expiryTime');
  const [sortOrder, setSortOrder] = useState('asc');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  // Toggle browser location for distance sorting
  const toggleLocation = () => {
    if (userLocation) {
      setUserLocation(null);
      setLocationStatus('');
      return;
    }
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('Locating you...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('Location acquired — showing foods sorted from nearest to farthest.');
      },
      (err) => {
        console.warn('Geolocation denied or unavailable', err);
        setLocationStatus('Location permission denied. Showing all donations.');
      }
    );
  };

  // Calculate distance between two coordinates in kilometers using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const processDonationsWithLocation = (rawDonations, loc) => {
    if (!Array.isArray(rawDonations)) return [];
    if (!loc) return rawDonations;

    const listWithDistance = rawDonations.map((item) => {
      let dKm = item.distanceKm;
      if (
        (dKm === undefined || dKm === null) &&
        Array.isArray(item.location?.coordinates) &&
        item.location.coordinates.length === 2
      ) {
        const [lon, lat] = item.location.coordinates;
        dKm = calculateDistance(loc.latitude, loc.longitude, lat, lon);
      }
      return { ...item, distanceKm: dKm };
    });

    // If user asked to sort by distance, sort by computed distance
    return listWithDistance.sort((a, b) => {
      const distA = a.distanceKm !== undefined && a.distanceKm !== null ? a.distanceKm : 999999;
      const distB = b.distanceKm !== undefined && b.distanceKm !== null ? b.distanceKm : 999999;
      return distA - distB;
    });
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        city: selectedCity || undefined,
        sortBy,
        sortOrder,
        status: 'AVAILABLE',
      };

      if (userLocation) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
      }

      let res;
      try {
        res = await donationService.getAll(params);
      } catch (reqErr) {
        // If geo query is rejected by server, gracefully fall back to fetching without coordinates
        if (params.latitude || params.longitude) {
          delete params.latitude;
          delete params.longitude;
          res = await donationService.getAll(params);
        } else {
          throw reqErr;
        }
      }

      if (res?.success && res?.data?.donations) {
        const processed = processDonationsWithLocation(res.data.donations, userLocation);
        setDonations(processed);
      } else {
        setDonations([]);
      }
    } catch (err) {
      console.error('Failed to load food listings', err);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, selectedCity, sortBy, sortOrder, userLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  // Helper for expiry countdown display
  const getExpiryCountdown = (expiryTime) => {
    const diffMs = new Date(expiryTime) - new Date();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Floating Ambient Element 1: Geo Matching */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 shadow-md text-xs font-bold text-forest-900 absolute -top-2 right-10 pointer-events-none select-none float-gentle z-10">
        <Compass className="w-3.5 h-3.5 text-emerald-600" />
        <span>Smart Geo-Radius Active</span>
      </div>

      {/* Floating Ambient Element 2: Food Hygiene */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-blue-300 shadow-md text-xs font-bold text-slate-800 absolute top-[40%] -left-6 pointer-events-none select-none float-delayed z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        <span>FSSAI Hygiene Standard Certified</span>
      </div>

      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Public Marketplace</span>
          <h1 className="text-3xl font-black text-brandText-primary tracking-tight mt-0.5">
            Available Surplus Food Listings
          </h1>
          <p className="text-xs sm:text-sm text-brandText-muted mt-1">
            Browse genuine non-expired donations ready for collection by verified community partners.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleLocation}
          className={`inline-flex items-center text-xs font-semibold px-4 py-2.5 rounded-xl border transition shadow-xs cursor-pointer self-start md:self-center ${
            userLocation
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
              : 'bg-forest-50 hover:bg-forest-100 text-forest-900 border-forest-200'
          }`}
          title={userLocation ? 'Click to clear location filter' : 'Sort food listings by distance'}
        >
          <Compass className={`w-4 h-4 mr-2 ${userLocation ? 'text-white' : 'text-forest-700'}`} />
          {userLocation ? '📍 Location Active (Click to reset)' : 'Sort by Distance'}
        </button>
      </div>

      {locationStatus && (
        <div className="text-xs text-forest-800 bg-forest-50/80 p-2.5 rounded-lg border border-forest-200 flex items-center">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-forest-600" />
          <span>{locationStatus}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <ScrollReveal variant="fade-up" delay={50}>
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-sm space-y-4 hover:border-emerald-300 transition-colors duration-200">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brandText-muted" />
              <input
                type="text"
                placeholder="Search by food dish, e.g. Steamed Rice, Breads, Veg Curry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="btn-press px-6 py-2.5 bg-forest-900 hover:bg-forest-800 text-white font-bold rounded-xl text-sm transition shadow-xs"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-brandText-muted mb-1">Food Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold"
              >
                <option value="">All Categories</option>
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-semibold text-brandText-muted mb-1">City / Region</label>
              <input
                type="text"
                placeholder="Filter by city, e.g. Coimbatore"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-semibold text-brandText-muted mb-1">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 rounded-lg border border-surface-border text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 font-semibold"
              >
                <option value="expiryTime-asc">Earliest Expiry First</option>
                <option value="createdAt-desc">Newest Listings</option>
                <option value="quantity-desc">Highest Quantity</option>
                <option value="quantity-asc">Lowest Quantity</option>
              </select>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : donations.length === 0 ? (
        <EmptyState
          title="No food donations found"
          description="Try broadening your search keywords or clearing the category filters."
          actionText="Clear All Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setSelectedCity('');
            setSortBy('expiryTime');
            setSortOrder('asc');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((item, idx) => (
            <ScrollReveal key={item._id} variant="fade-up" delay={idx * 50}>
              <div
                className="bg-white rounded-2xl overflow-hidden border border-surface-border shadow-xs card-interactive transition flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
                      }
                      alt={item.foodName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-300" />
                    {getExpiryCountdown(item.expiryTime)}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700">
                      {item.foodCategory}
                    </span>
                    <h3 className="font-bold text-lg text-brandText-primary line-clamp-1 mt-0.5">
                      {item.foodName}
                    </h3>
                  </div>

                  <p className="text-xs text-brandText-muted line-clamp-2">
                    {item.description || 'Hygienically packaged food donation ready for community redistribution.'}
                  </p>

                  <div className="bg-surface-light rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-brandText-muted block">Quantity</span>
                      <strong className="text-forest-900 font-bold text-sm">
                        {item.quantity} {item.unit}
                      </strong>
                    </div>
                    <div>
                      <span className="text-brandText-muted block">Est. Servings</span>
                      <strong className="text-brandText-primary font-bold text-sm">
                        {item.servings || Math.round(item.quantity * 2.2)} meals
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-brandText-muted pt-1">
                    <span className="flex items-center text-forest-800 font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-forest-600 flex-shrink-0" />
                      <span className="truncate max-w-[170px]">
                        {item.distanceKm !== undefined
                          ? `${item.distanceKm} km away • ${item.city || 'Coimbatore'}`
                          : (item.city || 'Coimbatore')}
                      </span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Pickup today
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/food/${item._id}`}
                  className="w-full block text-center py-2.5 px-4 bg-forest-900 hover:bg-forest-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition btn-press"
                >
                  View Details & Request
                </Link>
              </div>
            </div>
          </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
