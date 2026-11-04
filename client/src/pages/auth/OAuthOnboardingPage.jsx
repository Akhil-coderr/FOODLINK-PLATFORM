import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { 
  Building2, HeartHandshake, Bike, ShieldCheck, CheckCircle2, 
  ArrowRight, Phone, MapPin, Truck, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OAuthOnboardingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [onboardingToken, setOnboardingToken] = useState('');
  const [provider, setProvider] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [role, setRole] = useState('donor');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('641014');

  // Donor fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('restaurant');

  // NGO fields
  const [regNumber, setRegNumber] = useState('');
  const [receivingCapacityKg, setReceivingCapacityKg] = useState('150');
  const [acceptedCategories, setAcceptedCategories] = useState(['cooked', 'packaged', 'raw_produce']);

  // Volunteer fields
  const [transportType, setTransportType] = useState('bike');
  const [maxCapacityKg, setMaxCapacityKg] = useState('30');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('15');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('oauthToken');
    const prov = params.get('provider') || 'google';
    const em = params.get('email') || '';
    const nm = params.get('name') || '';

    if (!token) {
      toast.error('Invalid onboarding session');
      navigate('/login');
      return;
    }

    setOnboardingToken(token);
    setProvider(prov);
    setEmail(em);
    setName(nm);
    setOrgName(nm);
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter a valid phone number for logistics contact');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        onboardingToken,
        role,
        phone,
        address,
        city,
        state,
        postalCode,
        organizationName: orgName || name,
        organizationType: orgType,
        registrationNumber: regNumber,
        receivingCapacityKg: Number(receivingCapacityKg) || 100,
        acceptedFoodCategories: acceptedCategories,
        transportType,
        maximumCapacityKg: Number(maxCapacityKg) || 25,
        serviceRadiusKm: Number(serviceRadiusKm) || 15,
      };

      const res = await authService.oauthOnboard(payload);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setAuthSession(userToken, userData);
        toast.success(`Welcome to FoodLink, ${userData.name}!`);

        if (userData.role === 'donor') navigate('/donor/dashboard');
        else if (userData.role === 'ngo') navigate('/ngo/dashboard');
        else if (userData.role === 'volunteer') navigate('/volunteer/dashboard');
        else navigate('/');
      } else {
        toast.error(res.message || 'Onboarding failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Onboarding failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      <div className="bg-white rounded-3xl border border-surface-border shadow-xl p-8 sm:p-10 space-y-8">
        {/* Verified OAuth Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              G
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 uppercase">
                Google Account Verified
              </p>
              <p className="text-sm font-bold text-brandText-primary">{name} ({email})</p>
            </div>
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Verified Email
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brandText-primary tracking-tight">
            Complete Your FoodLink Profile
          </h1>
          <p className="text-sm text-brandText-muted mt-1">
            Choose your community role to finalize registration and unlock your customized portal.
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-brandText-primary uppercase">
            Select Your Role in the Food Redistribution Network
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                role === 'donor'
                  ? 'border-forest-600 bg-forest-50/80 ring-2 ring-forest-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <Building2 className={`w-6 h-6 mb-2 ${role === 'donor' ? 'text-forest-700' : 'text-slate-400'}`} />
              <div>
                <p className="font-bold text-sm text-brandText-primary">Food Donor</p>
                <p className="text-xs text-brandText-muted mt-0.5">Hotel, hostel, caterer, or restaurant with surplus meals</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('ngo')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                role === 'ngo'
                  ? 'border-forest-600 bg-forest-50/80 ring-2 ring-forest-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <HeartHandshake className={`w-6 h-6 mb-2 ${role === 'ngo' ? 'text-forest-700' : 'text-slate-400'}`} />
              <div>
                <p className="font-bold text-sm text-brandText-primary">NGO / Shelter</p>
                <p className="text-xs text-brandText-muted mt-0.5">Charity or care home feeding vulnerable citizens</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                role === 'volunteer'
                  ? 'border-forest-600 bg-forest-50/80 ring-2 ring-forest-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <Bike className={`w-6 h-6 mb-2 ${role === 'volunteer' ? 'text-forest-700' : 'text-slate-400'}`} />
              <div>
                <p className="font-bold text-sm text-brandText-primary">Dispatch Volunteer</p>
                <p className="text-xs text-brandText-muted mt-0.5">Transport surplus food with verified QR handovers</p>
              </div>
            </button>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-brandText-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                City / Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brandText-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
              Street Address
            </label>
            <input
              type="text"
              placeholder="e.g. 142 Avinashi Road, Peelamedu"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          {/* Role-Specific Fields */}
          {role === 'donor' && (
            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-brandText-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-forest-700" /> Donor Organization Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Organization / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Grand Residency Hotel"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Establishment Type
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                  >
                    <option value="restaurant">Restaurant / Eatery</option>
                    <option value="hotel">Hotel / Banquet</option>
                    <option value="hostel">University Hostel / Mess</option>
                    <option value="catering">Catering & Event Organizer</option>
                    <option value="corporate">Corporate Cafeteria</option>
                    <option value="other">Other Commercial Donor</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {role === 'ngo' && (
            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-brandText-primary flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-forest-700" /> NGO Registration & Verification
              </h3>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <strong>Notice:</strong> To safeguard food safety, NGO accounts remain in <em>Pending Verification</em> status until verified by an administrator. You will be able to browse food listings immediately.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    NGO / Trust Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Hope Shelter Foundation"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Legal Registration No. / Darpan ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="TN/2021/045892"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                  Food Receiving Capacity (kg per day)
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={receivingCapacityKg}
                  onChange={(e) => setReceivingCapacityKg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                />
              </div>
            </div>
          )}

          {role === 'volunteer' && (
            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-brandText-primary flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest-700" /> Logistics & Transport Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Transport Vehicle
                  </label>
                  <select
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                  >
                    <option value="bike">Motorbike / Scooter</option>
                    <option value="car">Car / Sedan</option>
                    <option value="van">Van / Small Truck</option>
                    <option value="bicycle">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Pickup Capacity (kg)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={maxCapacityKg}
                    onChange={(e) => setMaxCapacityKg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Setting Up Your Account...' : 'Complete Profile & Enter Portal'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
