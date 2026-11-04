import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-slate-300 pt-16 pb-12 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center text-forest-300">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Food<span className="text-forest-400">Link</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Rescue Food. Reduce Waste. Feed Hope." Connecting generous donors with verified NGOs and volunteer logistics networks to eliminate hunger and protect our planet.
            </p>
            <div className="flex items-center text-xs text-forest-300 space-x-2 bg-forest-900/60 p-2.5 rounded-lg border border-forest-800">
              <ShieldCheck className="w-4 h-4 text-forest-400 flex-shrink-0" />
              <span>Verified NGOs & Secure QR Pickup Protocol</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/food" className="hover:text-forest-300 transition">
                  Available Food Listings
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-forest-300 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-forest-300 transition">
                  Live Public Impact
                </Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-forest-300 transition">
                  Our NGO & Donor Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register/donor" className="hover:text-forest-300 transition">
                  Donor Registration (Hotels/Hostels)
                </Link>
              </li>
              <li>
                <Link to="/register/ngo" className="hover:text-forest-300 transition">
                  NGO Registration & Verification
                </Link>
              </li>
              <li>
                <Link to="/register/volunteer" className="hover:text-forest-300 transition">
                  Volunteer Sign-up & Rewards
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-forest-300 transition">
                  Sign In to Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-forest-300 transition text-forest-300 font-semibold">
                  Admin Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-forest-400 flex-shrink-0" />
                <span>Civil Aerodrome Post, Coimbatore, Tamil Nadu, 641014</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-forest-400 flex-shrink-0" />
                <span>support@foodlink.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-forest-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-forest-400 flex-shrink-0" />
                <span>Zero Hunger Initiative #SDG2 #SDG12</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-forest-900/80 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 sm:gap-0 px-2 sm:px-4">
          <p className="sm:pl-12">© {new Date().getFullYear()} FoodLink System. All rights reserved.</p>
          <div className="flex space-x-6 sm:pr-16">
            <Link to="/about" className="hover:text-white transition font-medium text-slate-300">
              About
            </Link>
            <Link to="/contact" className="hover:text-white transition font-medium text-slate-300">
              Contact
            </Link>
            <Link to="/admin/login" className="hover:text-white transition font-medium text-slate-300">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
