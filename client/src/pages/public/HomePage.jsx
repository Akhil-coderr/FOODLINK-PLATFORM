import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { impactService } from '../../services/impactService';
import {
  HeartHandshake,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Clock,
  MapPin,
  Users,
  UtensilsCrossed,
  Layers,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollReveal from '../../components/common/ScrollReveal';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { SkeletonCard } from '../../components/common/Skeleton';

// Curated Hero Image Collection (15 Stock Images cycling every 3 seconds)
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
    caption: 'Nutritious meals shared with community shelter children',
  },
  {
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
    caption: 'Volunteers packing freshly prepared banquet surplus',
  },
  {
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    caption: 'Farm-fresh organic vegetables diverted from landfills',
  },
  {
    url: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=800&auto=format&fit=crop',
    caption: 'Hygienic meal packaging and cold-chain distribution',
  },
  {
    url: 'https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=800&auto=format&fit=crop',
    caption: 'Community kitchen support for local accredited care homes',
  },
  {
    url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop',
    caption: 'Empowering grassroot hunger relief with real-time matching',
  },
  {
    url: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?q=80&w=800&auto=format&fit=crop',
    caption: 'Fresh artisan bakery breads rescued daily from bakeries',
  },
  {
    url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop',
    caption: 'Wholesome rice and curry packs prepared for evening distribution',
  },
  {
    url: 'https://images.unsplash.com/photo-1615865417491-9941019fbc00?q=80&w=800&auto=format&fit=crop',
    caption: 'Surplus fruit crates redistributed directly to elderly care centers',
  },
  {
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    caption: 'Healthy packaged salad and vegetable bowls ready for collection',
  },
  {
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop',
    caption: 'Freshly cooked nutritious soup and dinner supplies',
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    caption: 'Hotel banquet trays safely boxed for immediate delivery',
  },
  {
    url: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop',
    caption: 'Certified catering surplus packed in temperature-controlled containers',
  },
  {
    url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop',
    caption: 'Morning breakfast meals redirected before spoilage',
  },
  {
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop',
    caption: 'Clean commercial kitchen packaging surplus portions',
  },
];

// Curated Why FoodLink Section Image Collection (15 Stock Images cycling every 3 seconds)
const WHY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
    caption: 'Rapid community dispatch coordinated across Coimbatore',
  },
  {
    url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800&auto=format&fit=crop',
    caption: 'Verified NGO shelters receiving timely surplus nutrition',
  },
  {
    url: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?q=80&w=800&auto=format&fit=crop',
    caption: 'Standardized food safety and temperature holding protocol',
  },
  {
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop',
    caption: 'Cryptographic QR token handoffs verifying every donation',
  },
  {
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop',
    caption: 'Transparent collaboration between donors, NGOs, and volunteers',
  },
  {
    url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800&auto=format&fit=crop',
    caption: 'Real-time notification system connecting donors to nearby shelters',
  },
  {
    url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800&auto=format&fit=crop',
    caption: 'Rigorous quality inspection preserving culinary nutrition',
  },
  {
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=800&auto=format&fit=crop',
    caption: 'Dedicated volunteer delivery heroes bridging the distribution gap',
  },
  {
    url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop',
    caption: 'Safe transit ensuring fresh food arrives at peak condition',
  },
  {
    url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=800&auto=format&fit=crop',
    caption: 'Zero-waste redistribution keeping thousands of meals from landfills',
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    caption: 'Partner hospitality kitchens committing to sustainable practices',
  },
  {
    url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=800&auto=format&fit=crop',
    caption: 'Community impact tracking backed by verified audit trails',
  },
  {
    url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop',
    caption: 'Nutritious meals delivered directly to neighborhood feeding sites',
  },
  {
    url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop',
    caption: 'Empowering social workers with automated surplus logistics',
  },
  {
    url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=800&auto=format&fit=crop',
    caption: 'A united network feeding hope and sustaining communities every day',
  },
];

export default function HomePage() {
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [impactStats, setImpactStats] = useState({
    totalFoodRescuedKg: 1420,
    estimatedMealsSaved: 3124,
    completedDonations: 86,
    registeredNGOs: 14,
    activeVolunteers: 28,
    estimatedCarbonImpactKg: 3550,
  });
  const [loading, setLoading] = useState(true);

  // Dynamic Image Rotation States
  const [heroIndex, setHeroIndex] = useState(0);
  const [whyIndex, setWhyIndex] = useState(0);

  // Auto-rotate Hero Image every 3 seconds (pauses when browser tab is inactive)
  useEffect(() => {
    const heroTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
      }
    }, 3000);
    return () => clearInterval(heroTimer);
  }, []);

  // Preload next hero image
  useEffect(() => {
    const nextIdx = (heroIndex + 1) % HERO_IMAGES.length;
    const img = new Image();
    img.src = HERO_IMAGES[nextIdx].url;
  }, [heroIndex]);

  // Auto-rotate Why Section Image every 3 seconds (pauses when browser tab is inactive)
  useEffect(() => {
    const whyTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setWhyIndex((prev) => (prev + 1) % WHY_IMAGES.length);
      }
    }, 3000);
    return () => clearInterval(whyTimer);
  }, []);

  // Preload next why image
  useEffect(() => {
    const nextIdx = (whyIndex + 1) % WHY_IMAGES.length;
    const img = new Image();
    img.src = WHY_IMAGES[nextIdx].url;
  }, [whyIndex]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, impactRes] = await Promise.allSettled([
          donationService.getAll({ limit: 4, status: 'AVAILABLE' }),
          impactService.getPublicImpact(),
        ]);

        if (donationsRes.status === 'fulfilled' && donationsRes.value?.data?.donations) {
          setFeaturedDonations(donationsRes.value.data.donations.slice(0, 4));
        }

        if (impactRes.status === 'fulfilled' && impactRes.value?.data) {
          setImpactStats(impactRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20 relative overflow-hidden">
      {/* Floating Ambient Element 1: Hero Accent */}
      <div className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-emerald-300 shadow-lg text-xs font-bold text-forest-900 absolute top-10 right-12 pointer-events-none select-none float-gentle z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <Leaf className="w-4 h-4 text-emerald-600" />
        <span>100% Zero-Waste Goal • Live Sync</span>
      </div>

      {/* Floating Ambient Element 2: Mid-page Accent */}
      <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-300 shadow-md text-xs font-bold text-slate-800 absolute top-[44%] left-10 pointer-events-none select-none float-delayed z-10">
        <Flame className="w-4 h-4 text-amber-500" />
        <span>Real-Time Community Rescue Network</span>
      </div>

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-50 via-white to-surface-light pt-12 pb-20 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <ScrollReveal variant="fade-up" className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-forest-100 text-forest-900 border border-forest-200 shadow-xs">
                <Sparkles className="w-4 h-4 mr-1.5 text-forest-600" />
                Zero Food Waste & Hunger Redistribution Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brandText-primary tracking-tight leading-[1.1]">
                Rescue Food. <br />
                <span className="text-forest-800">Reduce Waste.</span> <br />
                <span className="text-forest-500">Feed Hope.</span>
              </h1>

              <p className="text-base sm:text-lg text-brandText-muted max-w-xl leading-relaxed font-medium">
                FoodLink directly connects restaurants, hotels, hostels, and caterers with verified local NGOs and volunteer logistics networks to turn surplus edible meals into timely nutrition for communities in need.
              </p>

              {/* CTAs with Interactive Feedback */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/donor/donations/create"
                  className="btn-press inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-black text-white bg-forest-900 hover:bg-forest-800 shadow-md hover:shadow-xl transition-all duration-200 group"
                >
                  <span>Donate Food</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>

                <Link
                  to="/food"
                  className="btn-press inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-black text-forest-900 bg-white hover:bg-forest-50 border-2 border-forest-200 shadow-sm transition-all duration-200"
                >
                  <UtensilsCrossed className="w-5 h-5 mr-2 text-forest-600" />
                  Find Available Food
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-forest-100/80">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-forest-600 shrink-0" />
                  <span className="text-xs font-bold text-brandText-primary">Verified NGOs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-forest-600 shrink-0" />
                  <span className="text-xs font-bold text-brandText-primary">Rapid Dispatch</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5 text-forest-600 shrink-0" />
                  <span className="text-xs font-bold text-brandText-primary">CO₂ Offset Tracking</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Hero Visual Card with Smooth Crossfade Rotation */}
            <ScrollReveal variant="scale-up" delay={150} className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-forest-600 to-emerald-400 rounded-3xl blur-lg opacity-30"></div>
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-surface-border">
                  {/* Dynamic Crossfade Image Container */}
                  <div className="relative h-64 rounded-2xl overflow-hidden mb-6 bg-slate-100 shadow-inner">
                    {HERO_IMAGES.map((imgObj, i) => (
                      <img
                        key={imgObj.url}
                        src={imgObj.url}
                        alt={imgObj.caption}
                        className={`absolute inset-0 w-full h-full object-cover crossfade-img transition-opacity duration-1000 ${
                          i === heroIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        loading={i === 0 ? 'eager' : 'lazy'}
                      />
                    ))}

                    {/* Dark gradient overlay for caption contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />

                    {/* Dynamic Caption */}
                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold line-clamp-1 drop-shadow-md">
                      {HERO_IMAGES[heroIndex].caption}
                    </div>
                  </div>

                  {/* Impact preview pills inside card with Animated Counters */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-forest-50 p-3.5 rounded-xl border border-forest-100">
                      <span className="block text-2xl font-black text-forest-900">
                        <AnimatedCounter target={impactStats.totalFoodRescuedKg || 1420} suffix=" kg" />
                      </span>
                      <span className="text-xs font-bold text-forest-700">Rescued to date</span>
                    </div>
                    <div className="bg-forest-50 p-3.5 rounded-xl border border-forest-100">
                      <span className="block text-2xl font-black text-forest-900">
                        <AnimatedCounter target={impactStats.estimatedMealsSaved || 3124} />
                      </span>
                      <span className="text-xs font-bold text-forest-700">Estimated Meals</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Platform Impact Metrics Banner with Animated Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <div className="bg-forest-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Real Environmental & Social Impact</h2>
              <p className="text-sm text-forest-200 mt-2 font-medium">
                Every verified delivery directly cuts greenhouse gas emissions and serves hungry families.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-forest-800/60 rounded-2xl border border-forest-700/60 card-interactive">
                <span className="text-3xl sm:text-4xl font-black text-white block">
                  <AnimatedCounter target={impactStats.totalFoodRescuedKg || 1420} suffix=" kg" />
                </span>
                <span className="text-xs font-bold text-forest-300 uppercase tracking-wider mt-1 block">
                  Food Rescued
                </span>
              </div>
              <div className="p-4 bg-forest-800/60 rounded-2xl border border-forest-700/60 card-interactive">
                <span className="text-3xl sm:text-4xl font-black text-forest-300 block">
                  <AnimatedCounter target={impactStats.estimatedMealsSaved || 3124} />
                </span>
                <span className="text-xs font-bold text-forest-300 uppercase tracking-wider mt-1 block">
                  Meals Served
                </span>
              </div>
              <div className="p-4 bg-forest-800/60 rounded-2xl border border-forest-700/60 card-interactive">
                <span className="text-3xl sm:text-4xl font-black text-white block">
                  <AnimatedCounter target={impactStats.registeredNGOs || 14} />
                </span>
                <span className="text-xs font-bold text-forest-300 uppercase tracking-wider mt-1 block">
                  Verified NGOs
                </span>
              </div>
              <div className="p-4 bg-forest-800/60 rounded-2xl border border-forest-700/60 card-interactive">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">
                  <AnimatedCounter target={impactStats.estimatedCarbonImpactKg || 3550} suffix=" kg" />
                </span>
                <span className="text-xs font-bold text-forest-300 uppercase tracking-wider mt-1 block">
                  CO₂e Prevented
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. How It Works Section with Staggered Scroll Animation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black text-forest-700 tracking-wider uppercase">Simple & Transparent</span>
            <h2 className="text-3xl font-black text-brandText-primary tracking-tight mt-1">
              How FoodLink Works
            </h2>
            <p className="text-sm text-brandText-muted mt-2 font-medium">
              A seamless three-sided coordination platform with real-time alerts and verified handoffs.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <ScrollReveal variant="fade-left" delay={50}>
            <div className="bg-white rounded-2xl p-6 border-2 border-surface-border shadow-xs card-interactive h-full flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-black text-lg mb-4 border border-forest-100 shadow-2xs">
                  01
                </div>
                <h3 className="text-lg font-black text-brandText-primary mb-2">1. Donors Publish Surplus</h3>
                <p className="text-sm text-brandText-muted leading-relaxed font-medium">
                  Hotels, restaurants, and catering events list fresh surplus meals with food category, estimated servings, expiry window, and pickup coordinates.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Step 2 */}
          <ScrollReveal variant="fade-up" delay={120}>
            <div className="bg-white rounded-2xl p-6 border-2 border-surface-border shadow-xs card-interactive h-full flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-black text-lg mb-4 border border-forest-100 shadow-2xs">
                  02
                </div>
                <h3 className="text-lg font-black text-brandText-primary mb-2">2. Smart NGO Matching & Claim</h3>
                <p className="text-sm text-brandText-muted leading-relaxed font-medium">
                  Our recommendation engine evaluates proximity, capacity, and dietary compatibility. Verified NGOs request meals with atomic anti-overselling locks.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Step 3 */}
          <ScrollReveal variant="fade-right" delay={190}>
            <div className="bg-white rounded-2xl p-6 border-2 border-surface-border shadow-xs card-interactive h-full flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-black text-lg mb-4 border border-forest-100 shadow-2xs">
                  03
                </div>
                <h3 className="text-lg font-black text-brandText-primary mb-2">3. QR Verified Logistics</h3>
                <p className="text-sm text-brandText-muted leading-relaxed font-medium">
                  Volunteers follow live navigation maps. Single-use cryptographic QR tokens verify collection from donors and final handover to the NGO shelter.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Featured Available Food Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-rose-600 text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Available Right Now</span>
              </div>
              <h2 className="text-3xl font-black text-brandText-primary tracking-tight mt-1">
                Active Food Listings
              </h2>
            </div>
            <Link
              to="/food"
              className="inline-flex items-center text-sm font-black text-forest-800 hover:text-forest-950 group"
            >
              <span>View All 20 Available Donations</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : featuredDonations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-surface-border text-center">
            <p className="text-sm text-brandText-muted">
              All current donations have been claimed or fulfilled! Check back shortly or list new surplus meals.
            </p>
            <Link
              to="/donor/donations/create"
              className="mt-4 inline-flex items-center px-4 py-2 bg-forest-900 text-white text-sm font-semibold rounded-lg"
            >
              List Surplus Food
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDonations.map((item, idx) => (
              <ScrollReveal key={item._id} variant="fade-up" delay={idx * 70}>
                <div className="bg-white rounded-2xl overflow-hidden border border-surface-border shadow-xs card-interactive flex flex-col justify-between h-full group">
                  <div>
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'
                        }
                        alt={item.foodName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-black px-2 py-0.5 rounded-md flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-amber-300" />
                        {new Date(item.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="p-4">
                      <span className="text-[11px] font-black uppercase tracking-wider text-forest-700 block mb-1">
                        {item.foodCategory}
                      </span>
                      <h3 className="font-black text-base text-brandText-primary line-clamp-1 mb-1 group-hover:text-forest-900 transition-colors">
                        {item.foodName}
                      </h3>
                      <p className="text-xs text-brandText-muted line-clamp-2 mb-3 font-medium">
                        {item.description || 'Nutritious surplus meal packed hygienically for immediate redistribution.'}
                      </p>

                      <div className="flex items-center justify-between text-xs font-bold py-2 border-t border-slate-100">
                        <span className="text-brandText-primary">
                          Qty: <strong className="text-forest-900 font-black">{item.quantity} {item.unit}</strong>
                        </span>
                        <span className="text-slate-600 flex items-center font-bold">
                          <MapPin className="w-3.5 h-3.5 mr-0.5 text-forest-600" />
                          {item.city || 'Coimbatore'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      to={`/food/${item._id}`}
                      className="w-full block text-center py-2 px-3 text-xs font-black rounded-xl bg-forest-50 text-forest-900 hover:bg-forest-100 border border-forest-200 transition btn-press"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* 5. Why Choose FoodLink with Dynamic Rotating Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-card rounded-3xl p-8 sm:p-12 border-2 border-surface-border shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <ScrollReveal variant="fade-left" className="space-y-5">
              <span className="text-xs font-black text-forest-700 tracking-wider uppercase">Built for Trust & Speed</span>
              <h2 className="text-3xl font-black text-brandText-primary tracking-tight">
                Why Donors & NGOs Rely on FoodLink
              </h2>
              <p className="text-sm text-brandText-muted leading-relaxed font-medium">
                Traditional donation coordination relies on chaotic phone calls and manual spreadsheets, leading to spoiled food and missed deliveries. FoodLink automates the entire loop with smart matching, geo-routing, and security checks.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="text-sm font-black text-brandText-primary block">Zero Overselling / Double Claiming</strong>
                    <span className="text-xs text-brandText-muted font-medium">
                      Atomic reservations guarantee that only one verified NGO claims a donation at a time.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="text-sm font-black text-brandText-primary block">Automated Expiry Safeguards</strong>
                    <span className="text-xs text-brandText-muted font-medium">
                      Smart background cron jobs trigger alerts at 6h, 3h, and 1h intervals to prioritize urgent food.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                    ✓
                  </div>
                  <div>
                    <strong className="text-sm font-black text-brandText-primary block">Volunteer Gamification</strong>
                    <span className="text-xs text-brandText-muted font-medium">
                      Volunteers earn verifiable milestone badges and leaderboard points for every safe completed dropoff.
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Dynamic Rotating Why Section Image */}
            <ScrollReveal variant="fade-right" delay={150}>
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-surface-border bg-slate-100 h-80">
                {WHY_IMAGES.map((imgObj, idx) => (
                  <img
                    key={imgObj.url}
                    src={imgObj.url}
                    alt={imgObj.caption}
                    className={`absolute inset-0 w-full h-full object-cover crossfade-img transition-opacity duration-1000 ${
                      idx === whyIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    loading="lazy"
                  />
                ))}

                {/* Dark gradient for caption readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

                {/* Live Caption */}
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-bold line-clamp-1 drop-shadow-md">
                  {WHY_IMAGES[whyIndex].caption}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
