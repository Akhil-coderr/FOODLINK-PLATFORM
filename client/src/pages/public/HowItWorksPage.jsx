import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Building2,
  Bike,
  ShieldCheck,
  QrCode,
  BellRing,
  ArrowRight,
  CheckCircle2,
  Scale,
  Clock,
  MapPin,
} from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function HowItWorksPage() {
  return (
    <div className="space-y-16 py-12 relative">
      {/* Floating Ambient Element 1 */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 shadow-md text-xs font-bold text-forest-900 absolute top-10 right-10 pointer-events-none select-none float-gentle z-10">
        <Bike className="w-3.5 h-3.5 text-emerald-600" />
        <span>Instant NGO Dispatch Coordination</span>
      </div>

      {/* Floating Ambient Element 2 */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-amber-300 shadow-md text-xs font-bold text-slate-800 absolute top-[42%] left-8 pointer-events-none select-none float-delayed z-10">
        <QrCode className="w-3.5 h-3.5 text-amber-600" />
        <span>Single-Use QR Token Protocol</span>
      </div>

      {/* Header */}
      <ScrollReveal variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-forest-700 tracking-wider uppercase bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            The FoodLink Ecosystem
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-brandText-primary tracking-tight">
            How FoodLink Connects Supply to Need
          </h1>
          <p className="text-base sm:text-lg text-brandText-muted max-w-2xl mx-auto">
            Explore the exact step-by-step journeys for Donors, NGOs, and Volunteers working in harmony to rescue food safely.
          </p>
        </section>
      </ScrollReveal>

      {/* Role Workflows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Donor Flow */}
        <ScrollReveal variant="fade-left" delay={50}>
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-border shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center font-bold shadow-2xs">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-forest-700 tracking-wider">Role 1</span>
                <h2 className="text-2xl font-black text-brandText-primary">For Donors (Hotels, Hostels & Caterers)</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-forest-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-forest-100">Step 1</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">List Surplus Food</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Input dish name, quantity, estimated servings, preparation time, and expiry window with hygiene tags.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-forest-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-forest-100">Step 2</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Review NGO Requests</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Receive instant notifications when verified NGOs request the donation. Accept with one click.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-forest-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-forest-100">Step 3</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Display Pickup QR</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Show the single-use pickup QR code on your mobile or tablet when the dispatched volunteer arrives.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-forest-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-forest-100">Step 4</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Track Impact</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  View real-time delivery confirmation, meals provided, and your business's environmental savings report.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* NGO Flow */}
        <ScrollReveal variant="fade-right" delay={80}>
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-border shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shadow-2xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-blue-700 tracking-wider">Role 2</span>
                <h2 className="text-2xl font-black text-brandText-primary">For NGOs & Community Kitchens</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-blue-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-blue-100">Step 1</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Get Verified</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Submit 80G/12A or society registration certificate for admin review to guarantee food safety compliance.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-blue-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-blue-100">Step 2</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Smart Recommendations</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Discover matching nearby donations based on your daily capacity and dietary categories accepted.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-blue-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-blue-100">Step 3</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Claim Food Safely</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Request meals with automatic anti-collision locking to ensure zero double-booking or wasted volunteer trips.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-blue-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-blue-100">Step 4</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Verify Delivery</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Scan the volunteer's handover code upon arrival to instantly mark the donation complete and release points.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Volunteer Flow */}
        <ScrollReveal variant="fade-left" delay={100}>
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-border shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-2xs">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider">Role 3</span>
                <h2 className="text-2xl font-black text-brandText-primary">For Volunteers & Transport Partners</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-amber-100">Step 1</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Receive Assignments</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Get alerted for pickup tasks within your vehicle capacity and service radius in real time.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-amber-100">Step 2</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Navigate Route</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Follow Leaflet map directions to the donor kitchen with one-click external map navigation.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-amber-100">Step 3</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Scan to Collect</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Scan the donor's QR code to verify quantity and packaging integrity before transport begins.
                </p>
              </div>
              <div className="bg-surface-light p-5 rounded-2xl border border-surface-border card-interactive hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-md transition-all duration-300">
                <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-amber-100">Step 4</span>
                <h3 className="font-black text-base text-brandText-primary mt-3 mb-1">Earn Points & Badges</h3>
                <p className="text-xs text-brandText-muted leading-relaxed font-medium">
                  Hand over food at the NGO, confirm completion, and earn 20 volunteer karma points and achievements.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA section */}
      <ScrollReveal variant="scale-up" delay={100}>
        <section className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-forest-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl card-interactive transition">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">Ready to Make an Impact?</h2>
            <p className="text-sm text-forest-200 mb-6 max-w-md mx-auto">
              Join hundreds of establishments and community advocates making zero food waste a reality today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register/donor"
                className="px-6 py-3 bg-white text-forest-900 font-bold rounded-xl hover:bg-forest-50 transition shadow-sm btn-press"
              >
                Register as Donor
              </Link>
              <Link
                to="/register/ngo"
                className="px-6 py-3 bg-forest-800 text-white font-bold rounded-xl hover:bg-forest-700 transition border border-forest-700 btn-press"
              >
                Register NGO
              </Link>
              <Link
                to="/register/volunteer"
                className="px-6 py-3 bg-forest-700 text-white font-bold rounded-xl hover:bg-forest-600 transition btn-press"
              >
                Become a Volunteer
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
