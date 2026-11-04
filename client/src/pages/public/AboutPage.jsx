import React from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../../components/common/ScrollReveal';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import {
  Target,
  Eye,
  Leaf,
  HeartHandshake,
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Inbox,
  Truck,
  QrCode,
  Gift,
  Clock,
  Zap,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Award,
} from 'lucide-react';

export default function AboutPage() {
  const coreValues = [
    {
      title: 'Food Sustainability',
      description:
        'Actively reducing commercial food waste, diverting organic matter from municipal landfills, and protecting our environment from greenhouse gas emissions.',
      icon: Leaf,
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    {
      title: 'Social Responsibility',
      description:
        'Championing hunger alleviation and human dignity by ensuring high-nutrition surplus meals reach underprivileged children, shelters, and people in need.',
      icon: HeartHandshake,
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    {
      title: 'Transparency',
      description:
        'Maintaining unshakeable trust between donors, NGOs, and volunteers through cryptographic QR handovers, food safety logs, and verified impact metrics.',
      icon: ShieldCheck,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    {
      title: 'Community Collaboration',
      description:
        'Bringing restaurants, hotels, charities, student volunteers, and civic leaders together in a unified, positive movement to solve urban food waste.',
      icon: Users,
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connecting Food Donors with NGOs',
      description:
        'Hotels, restaurants, banquet halls, and hostels list surplus edible food in seconds, instantly bridging the gap with accredited non-profit shelters.',
      icon: UtensilsCrossed,
      color: 'emerald',
    },
    {
      step: '02',
      title: 'Helping NGOs Discover Available Food Donations',
      description:
        'Shelters, orphanages, and community food pantries browse real-time listings, view dietary categories and expiry windows, and claim required quantities.',
      icon: Inbox,
      color: 'blue',
    },
    {
      step: '03',
      title: 'Enabling Volunteers to Collect & Deliver Food',
      description:
        'Our dedicated volunteer fleet receives instant dispatch assignments, picking up food from donor kitchens and transporting it directly to shelter gates.',
      icon: Truck,
      color: 'amber',
    },
    {
      step: '04',
      title: 'Providing Food Tracking & Donation Management',
      description:
        'End-to-end QR code handoffs, thermal freshness logs, and automated countdown timers guarantee that all rescued food remains safe, hygienic, and audited.',
      icon: QrCode,
      color: 'teal',
    },
    {
      step: '05',
      title: 'Rewarding Users Through Points, Badges & Hotel Coupons',
      description:
        'Active donors and volunteers earn Karma Points for every kilogram saved, unlocking milestone achievement badges and redeemable partner hotel coupons.',
      icon: Gift,
      color: 'purple',
    },
  ];

  const whyChoosePoints = [
    {
      title: 'Easy Food Donation Management',
      description:
        'Intuitive, mobile-ready donation publishing allows busy kitchen managers and banquet coordinators to list surplus food in under 60 seconds.',
      icon: Clock,
    },
    {
      title: 'Real-Time Donation Availability',
      description:
        'Instant web-socket notifications alert nearby verified NGOs the moment surplus meals become available, eliminating idle wait times.',
      icon: Zap,
    },
    {
      title: 'Efficient Pickup & Delivery Coordination',
      description:
        'Smart geo-matching coordinates nearby volunteer couriers with optimal pickup routes, ensuring hot food arrives fresh and ready to serve.',
      icon: MapPin,
    },
    {
      title: 'Transparent Donation Tracking',
      description:
        'Dual-checkpoint QR verification and real-time dashboard analytics give all stakeholders 100% transparency on food transit and delivery status.',
      icon: CheckCircle2,
    },
    {
      title: 'Community-Driven Food Rescue',
      description:
        'A passionate grassroots ecosystem connecting commercial donors, civic NGOs, and active volunteers working harmoniously toward zero urban hunger.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12 relative overflow-hidden">
      {/* Floating Dummy Ambient Element 1 (Subtle Top-Right Accent) */}
      <div className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-emerald-300 shadow-lg text-xs font-bold text-forest-900 absolute top-12 right-10 pointer-events-none select-none float-gentle z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <HeartHandshake className="w-4 h-4 text-emerald-600" />
        <span>42+ Active Community Partners</span>
      </div>

      {/* Floating Dummy Ambient Element 2 (Subtle Mid-Page Accent) */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-300 shadow-md text-xs font-bold text-slate-800 absolute top-[48%] left-8 pointer-events-none select-none float-delayed z-10">
        <Target className="w-3.5 h-3.5 text-blue-600" />
        <span>UN SDG-2 & SDG-12 Aligned</span>
      </div>

      {/* Hero Header */}
      <ScrollReveal variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-black text-forest-700 tracking-wider uppercase bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
            About FoodLink
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-brandText-primary tracking-tight">
            Empowering Communities to End Food Waste
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-brandText-muted max-w-3xl mx-auto leading-relaxed font-medium">
            FoodLink is a purpose-driven digital platform designed to bridge the tragic divide between edible surplus food and hungry community members through automated discovery, smart matching, and verified logistics.
          </p>
        </section>
      </ScrollReveal>

      {/* A & B: Our Mission and Our Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <ScrollReveal variant="fade-left" delay={50}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-xs card-interactive flex flex-col justify-between h-full hover:shadow-xl hover:border-emerald-300 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mb-6 border border-forest-100">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-brandText-primary mb-3">Our Mission</h2>
                <p className="text-sm text-brandText-muted leading-relaxed font-medium">
                  FoodLink's mission is to drastically reduce edible food waste by connecting food donors—including hotels, restaurants, banquet halls, hostels, and caterers—with verified NGOs, shelters, and individuals who need food most. We replace wasted meals with nourished lives through streamlined, technology-enabled food redistribution.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 text-xs font-bold text-forest-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Target: Zero edible food to landfills • 100% verified meal redistribution</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Vision Card */}
          <ScrollReveal variant="fade-right" delay={100}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-xs card-interactive flex flex-col justify-between h-full hover:shadow-xl hover:border-blue-300 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mb-6 border border-blue-100">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-brandText-primary mb-3">Our Vision</h2>
                <p className="text-sm text-brandText-muted leading-relaxed font-medium">
                  We envision a world where surplus food is redistributed efficiently, sustainably, and transparently, ensuring that no usable, nutritious food goes to waste. By fusing compassionate community spirit with smart digital logistics, we strive to build hunger-free cities anchored in ecological sustainability and human dignity.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 text-xs font-bold text-blue-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Aligned with UN Sustainable Development Goals: Zero Hunger (#2) & Responsible Consumption (#12)</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* The Problem Statement Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="scale-up" delay={80}>
          <div className="bg-forest-900 rounded-3xl p-6 sm:p-12 text-white shadow-xl card-interactive transition">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-forest-300 uppercase tracking-wider">The Global & Local Crisis</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 mb-4">
                The Food Waste vs. Hunger Paradox
              </h2>
              <p className="text-xs sm:text-sm text-forest-100 leading-relaxed mb-6">
                Globally, over 1.3 billion tons of edible food are wasted annually while hundreds of millions of people face chronic hunger. In urban centers, thousands of kilograms of untouched, high-nutrition banquet and restaurant surplus are dumped into landfills daily, generating methane while nearby shelters struggle for daily rations. FoodLink solves this imbalance by providing an instant, transparent redistribution channel.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-forest-800">
                <div>
                  <span className="text-3xl font-black text-amber-300">
                    <AnimatedCounter target={40} suffix="%" />
                  </span>
                  <p className="text-xs text-forest-200 mt-1 font-semibold">Of produced food wasted across the supply chain</p>
                </div>
                <div>
                  <span className="text-3xl font-black text-emerald-300">
                    <AnimatedCounter target={2.5} decimals={1} suffix=" kg" />
                  </span>
                  <p className="text-xs text-forest-200 mt-1 font-semibold">Average CO₂ equivalent emissions averted per kg saved</p>
                </div>
                <div>
                  <span className="text-3xl font-black text-white">
                    <AnimatedCounter target={100} suffix="%" />
                  </span>
                  <p className="text-xs text-forest-200 mt-1 font-semibold">Traceability through FoodLink verified handovers</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* C: Our Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-forest-700 tracking-wider uppercase bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              What Drives Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brandText-primary tracking-tight mt-3">
              Our Core Values
            </h2>
            <p className="text-xs sm:text-sm text-brandText-muted mt-2">
              The foundational principles guiding every food donation, volunteer dispatch, and community partnership.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, idx) => {
            const Icon = value.icon;
            return (
              <ScrollReveal key={idx} variant="fade-up" delay={idx * 80}>
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-surface-border shadow-sm card-interactive h-full flex flex-col justify-between">
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${value.bg} ${value.text} flex items-center justify-center mb-5 border ${value.border}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-brandText-primary mb-2">
                      {value.title}
                    </h3>
                    <p className="text-xs text-brandText-muted leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* D: How FoodLink Makes a Difference */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-forest-700 tracking-wider uppercase bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              End-to-End Redistribution
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-brandText-primary tracking-tight mt-3">
              How FoodLink Makes a Difference
            </h2>
            <p className="text-xs sm:text-sm text-brandText-muted mt-2">
              Our closed-loop platform unites donors, charities, and volunteer couriers through a transparent 5-step process.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {howItWorks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={idx} variant="fade-up" delay={idx * 70}>
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-surface-border shadow-sm card-interactive h-full flex flex-col justify-between relative">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-forest-50 text-forest-800 border border-forest-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-forest-700" />
                      </div>
                      <span className="text-xs font-black text-forest-800 bg-forest-100/70 px-2.5 py-1 rounded-lg">
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-brandText-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brandText-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* E: Why Choose FoodLink? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="scale-up" delay={50}>
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-12 border border-slate-200 card-interactive transition">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-forest-700 tracking-wider uppercase bg-white px-3 py-1 rounded-full border border-forest-200 shadow-2xs">
                Why We Stand Out
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brandText-primary tracking-tight mt-3">
                Why Choose FoodLink?
              </h2>
              <p className="text-xs sm:text-sm text-brandText-muted mt-2">
                Built specifically to overcome the timing, logistics, and verification barriers of traditional surplus food rescue.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyChoosePoints.map((point, idx) => {
                const Icon = point.icon;
                return (
                  <ScrollReveal key={idx} variant="fade-up" delay={idx * 60}>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs card-interactive h-full">
                      <div className="w-10 h-10 rounded-xl bg-forest-100/80 text-forest-800 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-forest-700" />
                      </div>
                      <h3 className="font-black text-sm text-brandText-primary mb-1.5">
                        {point.title}
                      </h3>
                      <p className="text-xs text-brandText-muted leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Community Action / Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="scale-up" delay={80}>
          <div className="bg-forest-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl card-interactive transition">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Be Part of the Solution to Hunger & Food Waste
              </h3>
              <p className="text-xs sm:text-sm text-forest-100 leading-relaxed">
                Whether you are a food establishment with surplus meals, an accredited NGO feeding families, or an active volunteer ready to deliver, your participation creates real, immediate impact.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <Link
                to="/register"
                className="px-6 py-3 bg-white hover:bg-forest-50 text-forest-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition text-center flex items-center justify-center gap-1.5 btn-press"
              >
                <span>Get Started Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-forest-700 transition text-center btn-press"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
