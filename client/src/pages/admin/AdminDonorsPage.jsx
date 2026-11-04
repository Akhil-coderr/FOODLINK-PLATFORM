import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Building2, Search, Filter, Phone, Mail, MapPin, CheckCircle, Ban, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import CustomSelect from '../../components/common/CustomSelect';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDonors();
  }, [filterType]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDonors({ organizationType: filterType || undefined });
      if (res.success && res.data) {
        setDonors(res.data.donors || []);
      }
    } catch (err) {
      console.error('Failed to load donors:', err);
      toast.error('Failed to load donor organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`Donor account status updated to ${newStatus}`);
      fetchDonors();
    } catch (err) {
      toast.error('Failed to update donor status');
    }
  };

  const filteredDonors = donors.filter((d) => {
    const org = (d.organizationName || '').toLowerCase();
    const name = (d.userId?.name || '').toLowerCase();
    const email = (d.userId?.email || '').toLowerCase();
    const city = (d.userId?.city || '').toLowerCase();
    const s = search.toLowerCase();
    return org.includes(s) || name.includes(s) || email.includes(s) || city.includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-emerald-400" />
            Donor Establishments Management
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Monitor and manage hotels, banquet halls, hostels, and restaurants donating surplus meals.
          </p>
        </div>
        <button
          onClick={fetchDonors}
          className="p-2.5 border-2 border-slate-700 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          title="Refresh Donors"
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-md flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-950 font-bold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search donors by organization, name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-slate-300 text-slate-950 font-bold bg-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-xs"
          />
        </div>
        <CustomSelect
          value={filterType}
          onChange={(val) => setFilterType(val)}
          options={[
            { value: '', label: 'All Donor Types' },
            { value: 'hotel', label: 'Hotels & Banquets' },
            { value: 'restaurant', label: 'Restaurants' },
            { value: 'hostel', label: 'University Hostels' },
            { value: 'catering', label: 'Caterers & Events' },
            { value: 'other', label: 'Other Donors' },
          ]}
          placeholder="All Donor Types"
        />
      </div>

      {/* Donors Table */}
      {loading ? (
        <LoadingSpinner text="Loading donors directory..." />
      ) : filteredDonors.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border-2 border-slate-300 text-center shadow-md">
          <EmptyState
            title="No donor establishments found"
            description="No establishments matched your search criteria. Try modifying your filter."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-slate-950 font-black">Establishment</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Contact Person</th>
                  <th className="py-4 px-4 text-slate-950 font-black">City & Address</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Type</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Total Rescues</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Status</th>
                  <th className="py-4 px-6 text-slate-950 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDonors.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-bold text-slate-950">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-black flex items-center justify-center text-xs shadow-xs">
                          {d.organizationName ? d.organizationName[0].toUpperCase() : 'D'}
                        </div>
                        <div>
                          <p className="text-slate-950 font-black text-sm">{d.organizationName || 'Unnamed Establishment'}</p>
                          <p className="text-[11px] text-emerald-950 font-extrabold">ID: #{d._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-950 text-sm">{d.userId?.name || 'N/A'}</p>
                      <p className="text-xs text-emerald-950 font-extrabold mt-0.5">{d.userId?.email}</p>
                      <p className="text-xs text-slate-950 font-bold mt-0.5">{d.userId?.phone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-black text-slate-950 text-sm">{d.userId?.city || 'Coimbatore'}</p>
                      <p className="text-xs text-slate-900 font-semibold truncate max-w-xs mt-0.5">{d.userId?.address || 'Standard Address'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-950 border border-amber-400">
                        {d.organizationType || 'donor'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-950 text-sm">
                      {d.totalDonations || 0} donations
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={d.userId?.accountStatus || 'active'} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      {d.userId?.accountStatus === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(d.userId?._id, 'suspended')}
                          className="px-3.5 py-1.5 text-xs font-black rounded-lg text-rose-950 bg-rose-100 hover:bg-rose-200 border border-rose-300 transition shadow-xs cursor-pointer"
                          title="Suspend Donor Account"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(d.userId?._id, 'active')}
                          className="px-3.5 py-1.5 text-xs font-black rounded-lg text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition shadow-xs cursor-pointer"
                          title="Reactivate Donor Account"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
