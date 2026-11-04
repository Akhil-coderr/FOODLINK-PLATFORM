import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Heart, ShieldCheck, ArrowRight, Award, Utensils, Users } from 'lucide-react';

export default function PartnersPage() {
  const donorPartners = [
    { name: 'Grand Residency Hotel', type: 'Luxury Hotel', city: 'Coimbatore', donations: '142 donations' },
    { name: 'Sree Annapoorna Catering', type: 'Event Caterer', city: 'Coimbatore', donations: '98 donations' },
    { name: 'PSG Tech Campus Mess', type: 'Institution / Hostel', city: 'Peelamedu', donations: '210 donations' },
    { name: 'Le Meridien Banquets', type: 'Convention Center', city: 'Avinashi Road', donations: '74 donations' },
    { name: 'Aroma Bakery & Cafe', type: 'Bakery Chain', city: 'RS Puram', donations: '130 donations' },
    { name: 'Royal Care Cafeteria', type: 'Healthcare Cafeteria', city: 'Neelambur', donations: '88 donations' },
  ];

  const ngoPartners = [
    { name: 'Hope Foundation Shelter', reg: 'NGO-TN-2018-8841', capacity: '350 kg/day', meals: '18,400 meals' },
    { name: 'Annai Karunai Illam', reg: 'NGO-TN-2015-1102', capacity: '200 kg/day', meals: '14,200 meals' },
    { name: 'Helping Hands Community Care', reg: 'NGO-TN-2020-4921', capacity: '500 kg/day', meals: '32,100 meals' },
    { name: 'Peace Care Home for Elderly', reg: 'NGO-TN-2019-3019', capacity: '150 kg/day', meals: '9,800 meals' },
    { name: 'Child Haven Orphanage', reg: 'NGO-TN-2017-7429', capacity: '180 kg/day', meals: '12,600 meals' },
    { name: 'Universal Mercy Pantry', reg: 'NGO-TN-2021-9980', capacity: '400 kg/day', meals: '24,500 meals' },
  ];

  return (
    <div className="space-y-16 py-12">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-bold text-forest-700 tracking-wider uppercase bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
          Our Trusted Network
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-brandText-primary tracking-tight">
          FoodLink Donor & NGO Partners
        </h1>
        <p className="text-base sm:text-lg text-brandText-muted max-w-2xl mx-auto">
          Over 60+ verified hospitality donors and registered non-profit organizations collaborate daily through our audited redistribution protocols.
        </p>
      </section>

      {/* Verified NGOs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brandText-primary">Verified NGO Partners</h2>
            <p className="text-xs text-brandText-muted">
              All NGO partners undergo rigorous verification including registration certificate and capacity audit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ngoPartners.map((ngo, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-brandText-primary">{ngo.name}</h3>
                  <span className="text-xs font-mono text-brandText-muted">{ngo.reg}</span>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg" title="Verified NGO">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-brandText-muted block">Capacity</span>
                  <strong className="text-brandText-primary">{ngo.capacity}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-brandText-muted block">Meals Served</span>
                  <strong className="text-forest-900">{ngo.meals}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hospitality Donors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-900 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brandText-primary">Hospitality & Corporate Donors</h2>
            <p className="text-xs text-brandText-muted">
              Hotels, university hostels, and catering partners championing zero food waste.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donorPartners.map((donor, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-brandText-primary">{donor.name}</h3>
                  <span className="text-xs font-semibold text-forest-700">{donor.type}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-forest-50 text-forest-800 rounded-md">
                  {donor.city}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-brandText-muted">Contributions:</span>
                <strong className="text-forest-900 font-bold">{donor.donations}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join the Network banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-forest-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">Become a FoodLink Certified Partner</h3>
            <p className="text-xs sm:text-sm text-forest-200 max-w-lg">
              Get an audited sustainability certificate for your establishment or streamline surplus food acquisition for your shelter.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/register/donor"
              className="px-5 py-3 rounded-xl bg-white text-forest-900 text-xs sm:text-sm font-bold shadow-md hover:bg-forest-50 transition"
            >
              Join as Donor
            </Link>
            <Link
              to="/register/ngo"
              className="px-5 py-3 rounded-xl bg-forest-800 text-white text-xs sm:text-sm font-bold border border-forest-700 hover:bg-forest-700 transition"
            >
              Register NGO
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
